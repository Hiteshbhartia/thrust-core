import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ArenaKPIDefinition = {
  id: string;
  role: string;
  kpi_name: string;
  label: string;
  type: 'number' | 'boolean';
  default_target: number;
  order_index: number;
  is_active: boolean;
};

export type ArenaKPIValue = {
  id: string;
  kpi_name: string;
  current_value: number;
  is_hit: boolean;
  date: string;
  role: string;
};

export type ArenaAlert = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  triggered_by: string;
  resolved: boolean;
  created_at: string;
};

export function useArenaOS(userId?: string, role?: string) {
  const [definitions, setDefinitions] = useState<ArenaKPIDefinition[]>([]);
  const [kpiValues, setKpiValues] = useState<ArenaKPIValue[]>([]);
  const [alerts, setAlerts] = useState<ArenaAlert[]>([]);
  const [sprintDefinitions, setSprintDefinitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch KPI Definitions (Global/Role-based)
    const fetchDefinitions = async () => {
      let query = (supabase as any).from('arena_kpi_definitions').select('*').eq('is_active', true).order('order_index');
      if (role) {
        query = query.eq('role', role);
      }
      const { data } = await query;
      if (data) setDefinitions(data);
    };

    // 2. Fetch Sprint Definitions
    const fetchSprints = async () => {
      if (!role) return;
      const { data } = await (supabase as any)
        .from('arena_sprints')
        .select('*')
        .eq('role', role)
        .order('start_time');
      if (data) setSprintDefinitions(data);
    };

    // 3. Fetch User KPI Values
    const fetchValues = async () => {
      if (!userId) return;
      const { data } = await (supabase as any)
        .from('arena_kpis')
        .select('*')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0]);
      if (data) setKpiValues(data);
    };

    // 4. Fetch User Alerts
    const fetchAlerts = async () => {
      if (!userId) return;
      const { data } = await (supabase as any)
        .from('arena_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      if (data) setAlerts(data);
    };

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDefinitions(), fetchSprints(), fetchValues(), fetchAlerts()]);
      setLoading(false);
    };

    init();

    // Realtime subscriptions
    const kpiChannel = supabase.channel('arena_kpis_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arena_kpis', filter: userId ? `user_id=eq.${userId}` : undefined } as any, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setKpiValues(prev => {
            const exists = prev.find(k => k.id === payload.new.id);
            if (exists) return prev.map(k => k.id === payload.new.id ? payload.new as ArenaKPIValue : k);
            return [...prev, payload.new as ArenaKPIValue];
          });
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(kpiChannel);
    };
  }, [userId, role]);

  const updateKPI = async (kpiName: string, increment?: number, isHit?: boolean) => {
    if (!userId || !role) return;
    const { error } = await (supabase as any).rpc('update_arena_kpi', {
      p_user_id: userId,
      p_role: role,
      p_kpi_name: kpiName,
      p_increment: increment,
      p_is_hit: isHit
    });
    return { error };
  };

  const submitEODReport = async (reportData: any) => {
    if (!userId || !role) return;
    const { error } = await (supabase as any)
      .from('arena_reports')
      .upsert([{
        user_id: userId,
        role: role,
        report_json: reportData,
        submitted_at: new Date().toISOString()
      }], { onConflict: 'user_id,role' });
    return { error };
  };

  return { definitions, sprintDefinitions, kpiValues, alerts, loading, updateKPI, submitEODReport };
}

// Admin Hook
export function useArenaAdmin() {
  const [allUsersPerformance, setAllUsersPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('profiles')
      .select('id, full_name, role');
    if (data) setAllUsersPerformance(data);
    setLoading(false);
  };

  const manageKPIDefinition = async (definition: Partial<ArenaKPIDefinition>) => {
    if (definition.id) {
      return await (supabase as any).from('arena_kpi_definitions').update(definition).eq('id', definition.id);
    } else {
      return await (supabase as any).from('arena_kpi_definitions').insert([definition]);
    }
  };

  const manageSprint = async (sprint: any) => {
    if (sprint.id) {
      return await (supabase as any).from('arena_sprints').update(sprint).eq('id', sprint.id);
    } else {
      return await (supabase as any).from('arena_sprints').insert([sprint]);
    }
  };

  return { allUsersPerformance, loading, fetchAdminData, manageKPIDefinition, manageSprint };
}

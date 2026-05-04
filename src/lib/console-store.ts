// Operator Console Store — Supabase-backed with localStorage fallback
// Per-employee state persisted to Supabase; synced in real-time

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getKPIProgress,
  upsertKPIProgress,
  getSprintStatus,
  upsertSprintStatus,
  getDecisions,
  addDecision as dbAddDecision,
  getEODReport,
  upsertEODReport,
  getShieldMode,
  setShieldMode as dbSetShieldMode,
  subscribeToConsole,
} from "./console-db";

export type KPIState = {
  id: string;
  value: number;
  isDone: boolean;
};

export type SprintState = {
  number: number;
  isDone: boolean;
};

export type Decision = {
  id?: string;
  text: string;
  created_at?: string;
};

export type ConsoleData = {
  kpis: Record<string, KPIState>;
  sprints: Record<number, SprintState>;
  decisions: Decision[];
  reportData: Record<string, string>;
  shieldMode: boolean;
  isLoaded: boolean;
};

const LS_KEY = (id: string, role: string) => `gp_console_v2_${id}_${role}`;

function readLocal(employeeId: string, playbookRole: string): Partial<ConsoleData> {
  try {
    const raw = localStorage.getItem(LS_KEY(employeeId, playbookRole));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLocal(employeeId: string, playbookRole: string, data: Partial<ConsoleData>) {
  try {
    localStorage.setItem(LS_KEY(employeeId, playbookRole), JSON.stringify(data));
  } catch { /* quota */ }
}

export function useConsoleState(
  employeeId: string,
  playbookRole: string,
  kpiIds: string[],
  sprintNumbers: number[]
) {
  const [data, setData] = useState<ConsoleData>(() => {
    const local = readLocal(employeeId, playbookRole);
    const kpis: Record<string, KPIState> = {};
    kpiIds.forEach(id => { kpis[id] = local.kpis?.[id] ?? { id, value: 0, isDone: false }; });
    const sprints: Record<number, SprintState> = {};
    sprintNumbers.forEach(n => { sprints[n] = local.sprints?.[n] ?? { number: n, isDone: false }; });
    return {
      kpis,
      sprints,
      decisions: local.decisions ?? [],
      reportData: local.reportData ?? {},
      shieldMode: local.shieldMode ?? false,
      isLoaded: false,
    };
  });

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [kpiRows, sprintRows, decisionRows, reportRow, shieldEnabled] = await Promise.all([
        getKPIProgress(employeeId, playbookRole),
        getSprintStatus(employeeId, playbookRole),
        getDecisions(employeeId, playbookRole),
        getEODReport(employeeId, playbookRole),
        getShieldMode(employeeId),
      ]);

      if (cancelled) return;

      setData(prev => {
        const kpis = { ...prev.kpis };
        kpiRows.forEach((row: any) => {
          kpis[row.kpi_id] = { id: row.kpi_id, value: row.value, isDone: row.is_done };
        });
        const sprints = { ...prev.sprints };
        sprintRows.forEach((row: any) => {
          sprints[row.sprint_number] = { number: row.sprint_number, isDone: row.is_done };
        });

        const next: ConsoleData = {
          kpis,
          sprints,
          decisions: decisionRows.map((r: any) => ({ id: r.id, text: r.text, created_at: r.created_at })),
          reportData: ((reportRow as any)?.report_data as Record<string, string>) ?? prev.reportData,
          shieldMode: shieldEnabled,
          isLoaded: true,
        };
        writeLocal(employeeId, playbookRole, next);
        return next;
      });
    }
    load();
    return () => { cancelled = true; };
  }, [employeeId, playbookRole]);

  // Real-time subscriptions
  useEffect(() => {
    const unsub = subscribeToConsole(employeeId, playbookRole, () => {
      // Re-fetch on any remote change
      Promise.all([
        getKPIProgress(employeeId, playbookRole),
        getSprintStatus(employeeId, playbookRole),
        getShieldMode(employeeId),
      ]).then(([kpiRows, sprintRows, shieldEnabled]) => {
        setData(prev => {
          const kpis = { ...prev.kpis };
          kpiRows.forEach((row: any) => {
            kpis[row.kpi_id] = { id: row.kpi_id, value: row.value, isDone: row.is_done };
          });
          const sprints = { ...prev.sprints };
          sprintRows.forEach((row: any) => {
            sprints[row.sprint_number] = { number: row.sprint_number, isDone: row.is_done };
          });
          return { ...prev, kpis, sprints, shieldMode: shieldEnabled };
        });
      });
    });
    return () => { unsub(); };
  }, [employeeId, playbookRole]);

  const updateKPI = useCallback(async (kpiId: string, value: number, isDone: boolean) => {
    setData(prev => {
      const next = { ...prev, kpis: { ...prev.kpis, [kpiId]: { id: kpiId, value, isDone } } };
      writeLocal(employeeId, playbookRole, next);
      return next;
    });
    await upsertKPIProgress(employeeId, playbookRole, kpiId, value, isDone);
  }, [employeeId, playbookRole]);

  const updateSprint = useCallback(async (sprintNumber: number, isDone: boolean) => {
    setData(prev => {
      const next = { ...prev, sprints: { ...prev.sprints, [sprintNumber]: { number: sprintNumber, isDone } } };
      writeLocal(employeeId, playbookRole, next);
      return next;
    });
    await upsertSprintStatus(employeeId, playbookRole, sprintNumber, isDone);
  }, [employeeId, playbookRole]);

  const addDecision = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const dec: Decision = { text, created_at: new Date().toISOString() };
    setData(prev => {
      const next = { ...prev, decisions: [dec, ...prev.decisions] };
      writeLocal(employeeId, playbookRole, next);
      return next;
    });
    await dbAddDecision(employeeId, playbookRole, text);
  }, [employeeId, playbookRole]);

  const updateReport = useCallback(async (key: string, value: string) => {
    setData(prev => {
      const next = { ...prev, reportData: { ...prev.reportData, [key]: value } };
      writeLocal(employeeId, playbookRole, next);
      return next;
    });
    // Debounce DB write handled externally
  }, [employeeId, playbookRole]);

  const saveReport = useCallback(async (reportData: Record<string, string>) => {
    await upsertEODReport(employeeId, playbookRole, reportData);
  }, [employeeId, playbookRole]);

  const toggleShieldMode = useCallback(async () => {
    setData(prev => {
      const next = { ...prev, shieldMode: !prev.shieldMode };
      writeLocal(employeeId, playbookRole, next);
      return next;
    });
    const newVal = !data.shieldMode;
    await dbSetShieldMode(employeeId, newVal);
  }, [employeeId, playbookRole, data.shieldMode]);

  return { data, updateKPI, updateSprint, addDecision, updateReport, saveReport, toggleShieldMode };
}

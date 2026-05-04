-- Gharpayy Arena – Operator OS: Modular Extension
-- Additive updates to the existing schema

-- ============ ENUMS ============
CREATE TYPE public.lead_stage AS ENUM ('new', 'contacted', 'tour_booked', 'tour_done', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high');

-- ============ TABLES ============

-- 1. Arena KPIs
CREATE TABLE IF NOT EXISTS public.arena_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  is_hit BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, kpi_name, role)
);

-- 2. Arena Sprints
CREATE TABLE IF NOT EXISTS public.arena_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  sprint_name TEXT NOT NULL,
  start_time TEXT NOT NULL, -- e.g. "10:30"
  end_time TEXT NOT NULL,   -- e.g. "12:00"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Arena Sprint Tasks
CREATE TABLE IF NOT EXISTS public.arena_sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES public.arena_sprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  expected_output TEXT,
  completed BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Leads (Create new, extend if existed)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  stage public.lead_stage DEFAULT 'new',
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already there
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='stage') THEN
    ALTER TABLE public.leads ADD COLUMN stage public.lead_stage DEFAULT 'new';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='last_activity_at') THEN
    ALTER TABLE public.leads ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='assigned_to') THEN
    ALTER TABLE public.leads ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Communications
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'call' or 'whatsapp'
  response_time INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Arena Alerts
CREATE TABLE IF NOT EXISTS public.arena_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity public.alert_severity DEFAULT 'medium',
  triggered_by TEXT, -- reason or function name
  resolved BOOLEAN DEFAULT false,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Arena Reports
CREATE TABLE IF NOT EXISTS public.arena_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  summary_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ RLS POLICIES ============

-- 2. Arena Sprints
ALTER TABLE public.arena_sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arena_sprints_read" ON public.arena_sprints FOR SELECT TO authenticated USING (true);

-- 3. Arena Sprint Tasks
ALTER TABLE public.arena_sprint_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arena_sprint_tasks_all" ON public.arena_sprint_tasks FOR ALL TO authenticated
USING (auth.uid() = user_id OR public.is_manager_or_admin(auth.uid()));

-- 4. Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
USING (assigned_to = auth.uid() OR public.is_manager_or_admin(auth.uid()));

-- 5. Communications
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communications_all" ON public.communications FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_manager_or_admin(auth.uid()));

-- 6. Arena Alerts
ALTER TABLE public.arena_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arena_alerts_all" ON public.arena_alerts FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_manager_or_admin(auth.uid()));

-- 7. Arena Reports
ALTER TABLE public.arena_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arena_reports_select" ON public.arena_reports FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_manager_or_admin(auth.uid()));

-- ============ KPI ATOMIC ACTIONS ============

CREATE OR REPLACE FUNCTION public.update_arena_kpi(
  p_user_id UUID,
  p_role TEXT,
  p_kpi_name TEXT,
  p_increment INTEGER DEFAULT NULL,
  p_is_hit BOOLEAN DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.arena_kpis (user_id, role, kpi_name, target, current_value, is_hit)
  VALUES (p_user_id, p_role, p_kpi_name, 0, COALESCE(p_increment, 0), COALESCE(p_is_hit, false))
  ON CONFLICT (user_id, kpi_name, role)
  DO UPDATE SET
    current_value = CASE 
      WHEN p_increment IS NOT NULL THEN arena_kpis.current_value + p_increment 
      ELSE arena_kpis.current_value 
    END,
    is_hit = CASE 
      WHEN p_is_hit IS NOT NULL THEN p_is_hit 
      ELSE arena_kpis.is_hit 
    END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ TRIGGERS & HELPERS ============

-- Helper for updated_at
CREATE TRIGGER trg_arena_kpis_updated BEFORE UPDATE ON public.arena_kpis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_arena_sprint_tasks_updated BEFORE UPDATE ON public.arena_sprint_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_kpis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_sprint_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;


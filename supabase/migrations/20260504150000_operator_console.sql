-- Operator Console: Full Backend Schema
-- Tables for roles, playbooks, KPI progress, sprints, decisions, reports, rules, comms

-- ============================================================
-- OPERATOR CONSOLE TABLES
-- ============================================================

-- KPI daily progress per employee per playbook
CREATE TABLE IF NOT EXISTS public.console_kpi_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL,
  playbook_role text NOT NULL,        -- e.g. "POD COMMAND"
  kpi_id text NOT NULL,               -- e.g. "connections"
  date text NOT NULL,                 -- YYYY-MM-DD
  value integer DEFAULT 0,
  is_done boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, playbook_role, kpi_id, date)
);

-- Sprint completion per employee per playbook per day
CREATE TABLE IF NOT EXISTS public.console_sprint_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL,
  playbook_role text NOT NULL,
  sprint_number integer NOT NULL,
  date text NOT NULL,
  is_done boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, playbook_role, sprint_number, date)
);

-- Hard decisions log
CREATE TABLE IF NOT EXISTS public.console_decisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL,
  playbook_role text NOT NULL,
  date text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- EOD reports
CREATE TABLE IF NOT EXISTS public.console_eod_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL,
  playbook_role text NOT NULL,
  date text NOT NULL,
  report_data jsonb DEFAULT '{}',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, playbook_role, date)
);

-- Shield mode state per employee
CREATE TABLE IF NOT EXISTS public.console_shield_mode (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT false,
  enabled_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE public.console_kpi_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.console_sprint_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.console_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.console_eod_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.console_shield_mode ENABLE ROW LEVEL SECURITY;

-- Open policies for now (anon key access - tighten in production)
CREATE POLICY "Allow all on console_kpi_progress" ON public.console_kpi_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on console_sprint_status" ON public.console_sprint_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on console_decisions" ON public.console_decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on console_eod_reports" ON public.console_eod_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on console_shield_mode" ON public.console_shield_mode FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.console_kpi_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.console_sprint_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.console_shield_mode;

-- ==========================================================
-- GHARPAYY ARENA - FULL BACKEND SYNC (DANGER: RUN IN SQL EDITOR)
-- This script creates all tables, functions, and triggers 
-- and seeds the system with the mandatory Operator OS data.
-- ==========================================================

-- 1. CLEANUP (Optional: Uncomment to reset)
-- DROP TABLE IF EXISTS arena_reports, arena_alerts, arena_sprint_tasks, arena_sprints, arena_kpis, arena_kpi_definitions, arena_communication_windows;

-- 2. CREATE SCHEMA TABLES
CREATE TABLE IF NOT EXISTS public.arena_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'number',
  default_target NUMERIC DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(role, kpi_name)
);

CREATE TABLE IF NOT EXISTS public.arena_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target NUMERIC DEFAULT 0,
  is_hit BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, kpi_name, date)
);

CREATE TABLE IF NOT EXISTS public.arena_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  sprint_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  instructions TEXT,
  metric_goal TEXT
);

CREATE TABLE IF NOT EXISTS public.arena_sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES public.arena_sprints(id),
  user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  expected_output TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'missed'
  date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS public.arena_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.arena_communication_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.arena_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  report_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ATOMIC KPI UPDATE FUNCTION
CREATE OR REPLACE FUNCTION update_arena_kpi(
  p_user_id UUID,
  p_role TEXT,
  p_kpi_name TEXT,
  p_increment NUMERIC DEFAULT NULL,
  p_is_hit BOOLEAN DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.arena_kpis (user_id, role, kpi_name, current_value, target, is_hit, date)
  SELECT 
    p_user_id, 
    p_role, 
    p_kpi_name, 
    COALESCE(p_increment, 0), 
    COALESCE((SELECT default_target FROM public.arena_kpi_definitions WHERE kpi_name = p_kpi_name AND role = p_role LIMIT 1), 0),
    COALESCE(p_is_hit, false), 
    CURRENT_DATE
  ON CONFLICT (user_id, kpi_name, date) 
  DO UPDATE SET 
    current_value = CASE WHEN p_increment IS NOT NULL THEN public.arena_kpis.current_value + p_increment ELSE public.arena_kpis.current_value END,
    is_hit = CASE WHEN p_is_hit IS NOT NULL THEN p_is_hit ELSE public.arena_kpis.is_hit END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SEED KPI DEFINITIONS
INSERT INTO public.arena_kpi_definitions (role, kpi_name, label, type, default_target, order_index)
VALUES 
  ('recruiter', 'interviews_completed', 'Interviews completed', 'number', 20, 1),
  ('recruiter', 'slots_locked', 'Slots locked', 'number', 10, 2),
  ('coach', 'day0_calls', 'Day 0 calls', 'number', 10, 1),
  ('floor_lead_tour', 'tours_booked', 'Tours booked', 'number', 25, 1),
  ('comm_shield', 'connections_per_person', 'Connections per person', 'number', 40, 1),
  ('hr', 'attendance_locked', 'Attendance locked', 'number', 1, 1)
ON CONFLICT (role, kpi_name) DO NOTHING;

-- 5. SEED SPRINTS
INSERT INTO public.arena_sprints (role, sprint_name, start_time, end_time)
VALUES 
  ('recruiter', 'Pipeline Sweep', '10:30', '12:00'),
  ('recruiter', 'Interviews', '12:00', '13:15'),
  ('floor_lead_tour', 'Tour Briefing', '10:00', '10:30'),
  ('comm_shield', 'Ghost Lead Clear', '11:00', '12:30')
ON CONFLICT DO NOTHING;

-- 6. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_kpis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_kpi_definitions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_sprints;

-- Gharpayy Arena – Operator OS: Dynamic KPI System & Admin Controls
-- This migration converts the static KPI system into a dynamic, admin-definable system.

-- ============ DYNAMIC KPI DEFINITIONS ============

CREATE TABLE IF NOT EXISTS public.arena_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  kpi_name TEXT NOT NULL, -- unique internal key, e.g. "interviews_completed"
  label TEXT NOT NULL,    -- UI display text, e.g. "Interviews completed"
  type TEXT DEFAULT 'number', -- 'number' or 'boolean'
  default_target NUMERIC DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, kpi_name)
);

-- ============ COMMUNICATION WINDOWS ============

CREATE TABLE IF NOT EXISTS public.arena_communication_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_time TEXT NOT NULL, -- e.g. "12:00"
  status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ UPDATE KPI VALUE TABLE ============

-- Ensure arena_kpis is additive and links correctly
-- We already have arena_kpis, but let's ensure it has a date field for history
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='arena_kpis' AND column_name='date') THEN
    ALTER TABLE public.arena_kpis ADD COLUMN date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- ============ UPDATE REPORTS TABLE ============

-- arena_reports (id, user_id, role, report_json, created_at)
-- This already exists from previous migration but let's ensure it's JSONB
ALTER TABLE public.arena_reports ALTER COLUMN summary_json TYPE JSONB;
ALTER TABLE public.arena_reports RENAME COLUMN summary_json TO report_json;

-- ============ ACCESS CONTROL (RLS) ============

ALTER TABLE public.arena_kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_communication_windows ENABLE ROW LEVEL SECURITY;

-- Everyone can read definitions
CREATE POLICY "arena_kpi_definitions_read" ON public.arena_kpi_definitions FOR SELECT TO authenticated USING (true);
-- Only admins can manage definitions
CREATE POLICY "arena_kpi_definitions_admin" ON public.arena_kpi_definitions FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Everyone can read comm windows
CREATE POLICY "arena_comm_windows_read" ON public.arena_communication_windows FOR SELECT TO authenticated USING (true);
-- Only admins can manage comm windows
CREATE POLICY "arena_comm_windows_admin" ON public.arena_communication_windows FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============ SEED INITIAL DEFINITIONS ============

INSERT INTO public.arena_kpi_definitions (role, kpi_name, label, type, default_target, order_index)
VALUES 
  -- RECRUITER
  ('recruiter', 'interviews_completed', 'Interviews completed', 'number', 20, 1),
  ('recruiter', 'slots_locked', 'Slots locked', 'number', 10, 2),
  ('recruiter', 'internshala_reminders', 'Internshala reminders sent', 'number', 50, 3),
  ('recruiter', 'referral_leads', 'Referral leads contacted', 'number', 15, 4),
  ('recruiter', 'profiles_sourced', 'Profiles sourced', 'number', 30, 5),
  ('recruiter', 'intent_questions', 'Intent questions asked', 'number', 40, 6),
  ('recruiter', 'decisions_10min', 'Decisions within 10 min', 'number', 20, 7),
  ('recruiter', 'ghost_rate', 'Candidate ghost rate', 'number', 5, 8),
  ('recruiter', 'jr_hr_logs', 'Junior HR logs audited', 'number', 10, 9),
  ('recruiter', 'jiya_briefed', 'Jiya briefed', 'number', 1, 10),
  -- COACH
  ('coach', 'day0_calls', 'Day 0 calls', 'number', 10, 1),
  ('coach', 'trainees_cleared', 'Trainees cleared', 'number', 5, 2),
  ('coach', 'skill_improvement', 'Skill improvement %', 'number', 20, 3),
  ('coach', 'simulations', 'Simulations per trainee', 'number', 5, 4),
  ('coach', 'sops_updated', 'SOPs updated', 'number', 2, 5),
  ('coach', 'mock_calls', 'Mock calls', 'number', 10, 6),
  ('coach', 'agenda_checks', 'Agenda checks', 'number', 1, 7),
  ('coach', 'intent_score', 'Intent score', 'number', 8, 8),
  -- FLOOR LEAD (TOUR OPS)
  ('floor_lead_tour', 'tours_booked', 'Tours booked', 'number', 25, 1),
  ('floor_lead_tour', 'tours_completed', 'Tours completed', 'number', 20, 2),
  ('floor_lead_tour', 'showup_percent', 'Show-up %', 'number', 80, 3),
  ('floor_lead_tour', 'closings', 'Closings', 'number', 5, 4),
  ('floor_lead_tour', 'noshow_analysis', 'No-show analysis', 'number', 1, 5),
  ('floor_lead_tour', 'pitch_corrections', 'Pitch corrections', 'number', 5, 6),
  ('floor_lead_tour', 'ooo_connected', 'OOO connected', 'number', 10, 7),
  ('floor_lead_tour', 'live_calls', 'Live calls listened', 'number', 10, 8),
  -- COMM SHIELD
  ('comm_shield', 'connections_per_person', 'Connections per person', 'number', 40, 1),
  ('comm_shield', 'ghost_leads_cleared', 'Ghost leads cleared', 'number', 20, 2),
  ('comm_shield', 'stuck_chats_24h', 'Stuck chats >24h', 'number', 0, 3),
  ('comm_shield', 'lead_journeys', 'Lead journeys audited', 'number', 10, 4),
  ('comm_shield', 'real_time_corrections', 'Real-time corrections', 'number', 5, 5),
  ('comm_shield', 'comm_windows', 'Comm windows sent on time', 'number', 3, 6),
  ('comm_shield', 'abc_scoring', 'A/B/C scoring', 'number', 1, 7),
  ('comm_shield', 'c_player_1on1', 'C-player 1:1 done', 'number', 1, 8),
  -- HR
  ('hr', 'attendance_locked', 'Attendance locked', 'number', 1, 1),
  ('hr', 'late_calls', 'Late calls handled', 'number', 10, 2),
  ('hr', 'leave_decisions', 'Leave decisions', 'number', 5, 3),
  ('hr', 'payroll_exceptions', 'Payroll exceptions', 'number', 0, 4),
  ('hr', 'policy_questions', 'Policy questions', 'number', 10, 5),
  ('hr', 'onboarding_kits', 'Onboarding kits', 'number', 5, 6),
  ('hr', 'compliance_audit', 'Compliance audit', 'number', 1, 7)
ON CONFLICT (role, kpi_name) DO NOTHING;

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_kpi_definitions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_communication_windows;

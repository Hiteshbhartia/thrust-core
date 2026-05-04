-- Seed Data for Gharpayy Arena – Operator OS
-- This populates the system with initial sprints and KPIs for testing

-- 1. Seed Sprints for Recruiter
INSERT INTO public.arena_sprints (role, sprint_name, start_time, end_time)
VALUES 
  ('recruiter', 'Pipeline Sweep', '10:30', '12:00'),
  ('recruiter', 'Interviews', '12:00', '13:15'),
  ('recruiter', 'Slots Locking', '14:30', '16:00'),
  ('recruiter', 'EOD Reporting', '18:30', '19:00');

-- 2. Seed Sprints for Floor Lead (Tour Ops)
INSERT INTO public.arena_sprints (role, sprint_name, start_time, end_time)
VALUES 
  ('floor_lead_tour', 'Tour Briefing', '10:00', '10:30'),
  ('floor_lead_tour', 'Live Field Sync', '12:00', '13:00'),
  ('floor_lead_tour', 'Closing Pulse', '16:00', '17:30'),
  ('floor_lead_tour', 'Audit & Score', '18:00', '19:00');

-- 3. Seed Initial KPIs for Tanya (Recruiter)
-- Assuming Tanya's UUID matches her seed ID for this demonstration
-- In a real DB, you'd use the actual UUID from the profiles table
DO $$ 
DECLARE 
  tanya_id UUID;
BEGIN
  SELECT id INTO tanya_id FROM public.profiles WHERE email = 'tanya.b@example.com' LIMIT 1;
  
  IF tanya_id IS NOT NULL THEN
    INSERT INTO public.arena_kpis (user_id, role, kpi_name, target, current_value)
    VALUES 
      (tanya_id, 'recruiter', 'interviews_completed', 20, 4),
      (tanya_id, 'recruiter', 'slots_locked', 10, 2),
      (tanya_id, 'recruiter', 'internshala_reminders', 50, 15),
      (tanya_id, 'recruiter', 'referral_leads', 15, 3)
    ON CONFLICT (user_id, kpi_name, role) DO NOTHING;
  END IF;
END $$;

-- 4. Seed Initial KPIs for Priya (Sales Lead / Floor Lead)
DO $$ 
DECLARE 
  priya_id UUID;
BEGIN
  SELECT id INTO priya_id FROM public.profiles WHERE email = 'priya.s@example.com' LIMIT 1;
  
  IF priya_id IS NOT NULL THEN
    INSERT INTO public.arena_kpis (user_id, role, kpi_name, target, current_value)
    VALUES 
      (priya_id, 'floor_lead_tour', 'tours_booked', 25, 8),
      (priya_id, 'floor_lead_tour', 'tours_completed', 20, 5),
      (priya_id, 'floor_lead_tour', 'closings', 5, 1)
    ON CONFLICT (user_id, kpi_name, role) DO NOTHING;
  END IF;
END $$;

-- 5. Seed Initial Sprint Tasks for Tanya
DO $$ 
DECLARE 
  tanya_id UUID;
  sprint_id UUID;
BEGIN
  SELECT id INTO tanya_id FROM public.profiles WHERE email = 'tanya.b@example.com' LIMIT 1;
  SELECT id INTO sprint_id FROM public.arena_sprints WHERE role = 'recruiter' AND sprint_name = 'Pipeline Sweep' LIMIT 1;
  
  IF tanya_id IS NOT NULL AND sprint_id IS NOT NULL THEN
    INSERT INTO public.arena_sprint_tasks (sprint_id, user_id, description, expected_output)
    VALUES 
      (sprint_id, tanya_id, 'Check Internshala for new applicants', '10 new profiles'),
      (sprint_id, tanya_id, 'Send reminder to 4pm candidates', 'Confirmations received');
  END IF;
END $$;

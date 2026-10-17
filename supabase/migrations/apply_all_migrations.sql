-- ==============================================================================
-- BRIGHTPATH CRM — MASTER ALL-IN-ONE MIGRATION SCRIPT
-- ==============================================================================
-- Run this complete script in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHEMA DEFINITION
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'counsellor')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  course_interest text NOT NULL,
  source text NOT NULL CHECK (source IN ('Website', 'Walk-in', 'Call', 'Referral', 'Social Media', 'Other')),
  status text NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New',
  lost_reason text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL,
  note text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('lead_created', 'status_changed', 'followup_created', 'followup_completed', 'note_added')),
  description text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_due_status ON public.follow_ups(due_at, status);
CREATE INDEX IF NOT EXISTS idx_followups_assigned_to ON public.follow_ups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT role IN ('admin', 'manager') FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- POLICIES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own_policy" ON public.profiles;
CREATE POLICY "profiles_update_own_policy" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin()));

DROP POLICY IF EXISTS "profiles_admin_manage_policy" ON public.profiles;
CREATE POLICY "profiles_admin_manage_policy" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT TO authenticated
USING (public.is_manager() OR assigned_to = auth.uid() OR created_by = auth.uid());

DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE TO authenticated
USING (public.is_manager() OR assigned_to = auth.uid() OR created_by = auth.uid())
WITH CHECK (public.is_manager() OR assigned_to = auth.uid() OR created_by = auth.uid());

DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "followups_select_policy" ON public.follow_ups;
CREATE POLICY "followups_select_policy" ON public.follow_ups FOR SELECT TO authenticated
USING (public.is_manager() OR assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
));

DROP POLICY IF EXISTS "followups_insert_policy" ON public.follow_ups;
CREATE POLICY "followups_insert_policy" ON public.follow_ups FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "followups_update_policy" ON public.follow_ups;
CREATE POLICY "followups_update_policy" ON public.follow_ups FOR UPDATE TO authenticated
USING (public.is_manager() OR assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
));

DROP POLICY IF EXISTS "followups_delete_policy" ON public.follow_ups;
CREATE POLICY "followups_delete_policy" ON public.follow_ups FOR DELETE TO authenticated
USING (public.is_manager());

DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy" ON public.activities FOR SELECT TO authenticated
USING (public.is_manager() OR EXISTS (
  SELECT 1 FROM public.leads WHERE leads.id = activities.lead_id AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
));

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy" ON public.activities FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- 4. DEMO SEED DATA
DO $$
DECLARE
  v_lead_1 uuid := '11111111-1111-1111-1111-111111111111';
  v_lead_2 uuid := '22222222-2222-2222-2222-222222222222';
  v_lead_3 uuid := '33333333-3333-3333-3333-333333333333';
  v_lead_4 uuid := '44444444-4444-4444-4444-444444444444';
  v_lead_5 uuid := '55555555-5555-5555-5555-555555555555';
  v_lead_6 uuid := '66666666-6666-6666-6666-666666666666';
  v_lead_7 uuid := '77777777-7777-7777-7777-777777777777';
  v_lead_8 uuid := '88888888-8888-8888-8888-888888888888';
  v_first_profile uuid;
BEGIN
  SELECT id INTO v_first_profile FROM public.profiles LIMIT 1;

  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes, created_at, updated_at)
  VALUES
    (v_lead_1, 'Aarav Sharma', 'aarav.sharma@example.com', '+91 98765 43210', 'Full Stack Web Development', 'Website', 'New', NULL, v_first_profile, v_first_profile, 'Inquired through website form. Interested in React & Node.js batch.', now() - interval '2 hours', now() - interval '2 hours'),
    (v_lead_2, 'Priya Patel', 'priya.patel@example.com', '+91 98234 56789', 'Data Science & AI', 'Walk-in', 'Contacted', NULL, v_first_profile, v_first_profile, 'Visited academy campus. Discussed Python prerequisites.', now() - interval '1 day', now() - interval '4 hours'),
    (v_lead_3, 'Rohan Mehta', 'rohan.mehta@example.com', '+91 97123 45678', 'Cloud & DevOps Engineering', 'Referral', 'Qualified', NULL, v_first_profile, v_first_profile, 'Junior admin experience. AWS & Kubernetes prep.', now() - interval '3 days', now() - interval '1 day'),
    (v_lead_4, 'Ananya Iyer', 'ananya.iyer@example.com', '+91 96543 21098', 'UI/UX Design Masterclass', 'Social Media', 'Converted', NULL, v_first_profile, v_first_profile, 'Admission fee completed. Enrolled in upcoming cohort.', now() - interval '5 days', now() - interval '12 hours'),
    (v_lead_5, 'Vikram Singh', 'vikram.singh@example.com', '+91 95432 10987', 'Full Stack Web Development', 'Call', 'Lost', 'Relocating to another city for university', v_first_profile, v_first_profile, 'Student moving out of state.', now() - interval '7 days', now() - interval '2 days'),
    (v_lead_6, 'Sneha Rao', 'sneha.rao@example.com', '+91 94321 09876', 'Data Science & AI', 'Website', 'New', NULL, v_first_profile, v_first_profile, 'Downloaded course syllabus.', now() - interval '30 minutes', now() - interval '30 minutes'),
    (v_lead_7, 'Aditya Verma', 'aditya.verma@example.com', '+91 93210 98765', 'Cloud & DevOps Engineering', 'Walk-in', 'Contacted', NULL, v_first_profile, v_first_profile, 'Discussed lab infrastructure.', now() - interval '2 days', now() - interval '1 day'),
    (v_lead_8, 'Kavita Nair', 'kavita.nair@example.com', '+91 92109 87654', 'UI/UX Design Masterclass', 'Referral', 'Qualified', NULL, v_first_profile, v_first_profile, 'Portfolio review scheduled.', now() - interval '4 days', now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  IF v_first_profile IS NOT NULL THEN
    INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by, created_at)
    VALUES
      (v_lead_2, v_first_profile, now() - interval '2 days', 'Follow up regarding Data Science syllabus review and scholarship eligibility.', 'pending', NULL, v_first_profile, now() - interval '3 days'),
      (v_lead_3, v_first_profile, now() + interval '1 day', 'Call back to confirm Cloud & DevOps batch enrollment and payment schedule.', 'pending', NULL, v_first_profile, now() - interval '1 day'),
      (v_lead_8, v_first_profile, now() + interval '3 days', 'Send design portfolio assessment feedback and invite for masterclass demo.', 'pending', NULL, v_first_profile, now() - interval '2 days'),
      (v_lead_4, v_first_profile, now() - interval '2 days', 'Send welcome packet and onboarding portal credentials.', 'completed', now() - interval '1 day', v_first_profile, now() - interval '4 days')
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES
    (v_lead_1, v_first_profile, 'lead_created', 'New enquiry submitted via Website landing page.', '{"source": "Website"}'::jsonb, now() - interval '2 hours'),
    (v_lead_2, v_first_profile, 'lead_created', 'Lead created from in-person campus walk-in.', '{"source": "Walk-in"}'::jsonb, now() - interval '1 day'),
    (v_lead_2, v_first_profile, 'status_changed', 'Status changed from New to Contacted after campus briefing.', '{"previous_status": "New", "new_status": "Contacted"}'::jsonb, now() - interval '4 hours'),
    (v_lead_4, v_first_profile, 'status_changed', 'Status updated to Converted after successful enrollment fee receipt.', '{"previous_status": "Qualified", "new_status": "Converted"}'::jsonb, now() - interval '12 hours'),
    (v_lead_5, v_first_profile, 'status_changed', 'Status updated to Lost. Reason: Relocating to another city for university.', '{"previous_status": "Contacted", "new_status": "Lost", "reason": "Relocation"}'::jsonb, now() - interval '2 days')
  ON CONFLICT DO NOTHING;
END $$;

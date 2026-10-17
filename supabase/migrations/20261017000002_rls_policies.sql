-- ==============================================================================
-- BrightPath CRM — Migration 02: Row Level Security (RLS) & Access Policies
-- ==============================================================================

-- Enable Row Level Security on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
-- These bypass table RLS recursion when checking the current user's role.
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

-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true); -- Authenticated users can view profile names/roles for assignee dropdowns

DROP POLICY IF EXISTS "profiles_update_own_policy" ON public.profiles;
CREATE POLICY "profiles_update_own_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent self-promotion: regular users cannot alter their role column
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
  );

DROP POLICY IF EXISTS "profiles_admin_manage_policy" ON public.profiles;
CREATE POLICY "profiles_admin_manage_policy"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. LEADS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    public.is_manager() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.is_manager() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 4. FOLLOW_UPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "followups_select_policy" ON public.follow_ups;
CREATE POLICY "followups_select_policy"
  ON public.follow_ups
  FOR SELECT
  TO authenticated
  USING (
    public.is_manager() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "followups_insert_policy" ON public.follow_ups;
CREATE POLICY "followups_insert_policy"
  ON public.follow_ups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "followups_update_policy" ON public.follow_ups;
CREATE POLICY "followups_update_policy"
  ON public.follow_ups
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "followups_delete_policy" ON public.follow_ups;
CREATE POLICY "followups_delete_policy"
  ON public.follow_ups
  FOR DELETE
  TO authenticated
  USING (
    public.is_manager()
  );

-- ------------------------------------------------------------------------------
-- 5. ACTIVITIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (
    public.is_manager() OR
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = activities.lead_id
      AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
  );

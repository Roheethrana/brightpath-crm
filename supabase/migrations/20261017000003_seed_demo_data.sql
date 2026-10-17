-- ==============================================================================
-- BrightPath CRM — Migration 03: Fictional Academy Demo Seed Data
-- ==============================================================================
-- Uses idempotent INSERT ON CONFLICT or conditional checks.
-- All student records are strictly fictional for educational and workshop testing.
-- ==============================================================================

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
  -- Look up first available profile to attach created_by/assigned_to if any exists
  SELECT id INTO v_first_profile FROM public.profiles LIMIT 1;

  -- 1. SEED LEADS
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes, created_at, updated_at)
  VALUES
    (
      v_lead_1,
      'Aarav Sharma',
      'aarav.sharma@example.com',
      '+91 98765 43210',
      'Full Stack Web Development',
      'Website',
      'New',
      NULL,
      v_first_profile,
      v_first_profile,
      'Inquired through website form. Interested in React & Node.js batch starting next month.',
      now() - interval '2 hours',
      now() - interval '2 hours'
    ),
    (
      v_lead_2,
      'Priya Patel',
      'priya.patel@example.com',
      '+91 98234 56789',
      'Data Science & AI',
      'Walk-in',
      'Contacted',
      NULL,
      v_first_profile,
      v_first_profile,
      'Visited academy campus. Discussed Python prerequisites and weekend batch timings.',
      now() - interval '1 day',
      now() - interval '4 hours'
    ),
    (
      v_lead_3,
      'Rohan Mehta',
      'rohan.mehta@example.com',
      '+91 97123 45678',
      'Cloud & DevOps Engineering',
      'Referral',
      'Qualified',
      NULL,
      v_first_profile,
      v_first_profile,
      'Has 1 year junior admin experience. High intent for AWS & Kubernetes certification prep.',
      now() - interval '3 days',
      now() - interval '1 day'
    ),
    (
      v_lead_4,
      'Ananya Iyer',
      'ananya.iyer@example.com',
      '+91 96543 21098',
      'UI/UX Design Masterclass',
      'Social Media',
      'Converted',
      NULL,
      v_first_profile,
      v_first_profile,
      'Admission fee completed. Enrolled in upcoming Figma & Design Systems cohort.',
      now() - interval '5 days',
      now() - interval '12 hours'
    ),
    (
      v_lead_5,
      'Vikram Singh',
      'vikram.singh@example.com',
      '+91 95432 10987',
      'Full Stack Web Development',
      'Call',
      'Lost',
      'Relocating to another city for university',
      v_first_profile,
      v_first_profile,
      'Student moving out of state. Unable to attend in-person or live schedule.',
      now() - interval '7 days',
      now() - interval '2 days'
    ),
    (
      v_lead_6,
      'Sneha Rao',
      'sneha.rao@example.com',
      '+91 94321 09876',
      'Data Science & AI',
      'Website',
      'New',
      NULL,
      v_first_profile,
      v_first_profile,
      'Downloaded course syllabus. Wants call regarding career placement support.',
      now() - interval '30 minutes',
      now() - interval '30 minutes'
    ),
    (
      v_lead_7,
      'Aditya Verma',
      'aditya.verma@example.com',
      '+91 93210 98765',
      'Cloud & DevOps Engineering',
      'Walk-in',
      'Contacted',
      NULL,
      v_first_profile,
      v_first_profile,
      'Discussed lab infrastructure and hands-on cloud credits access.',
      now() - interval '2 days',
      now() - interval '1 day'
    ),
    (
      v_lead_8,
      'Kavita Nair',
      'kavita.nair@example.com',
      '+91 92109 87654',
      'UI/UX Design Masterclass',
      'Referral',
      'Qualified',
      NULL,
      v_first_profile,
      v_first_profile,
      'Portfolio review scheduled. High conversion likelihood.',
      now() - interval '4 days',
      now() - interval '2 days'
    )
  ON CONFLICT (id) DO NOTHING;

  -- 2. SEED FOLLOW-UPS (Overdue, Upcoming & Completed)
  -- Note: Follow-ups require an assigned_to profile if foreign key enforcement is active.
  IF v_first_profile IS NOT NULL THEN
    INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by, created_at)
    VALUES
      -- OVERDUE TASK: due 2 days ago, still pending
      (
        v_lead_2,
        v_first_profile,
        now() - interval '2 days',
        'Follow up regarding Data Science syllabus review and scholarship eligibility.',
        'pending',
        NULL,
        v_first_profile,
        now() - interval '3 days'
      ),
      -- UPCOMING TASK: due tomorrow at 11:00 AM
      (
        v_lead_3,
        v_first_profile,
        now() + interval '1 day',
        'Call back to confirm Cloud & DevOps batch enrollment and payment schedule.',
        'pending',
        NULL,
        v_first_profile,
        now() - interval '1 day'
      ),
      -- UPCOMING TASK: due in 3 days
      (
        v_lead_8,
        v_first_profile,
        now() + interval '3 days',
        'Send design portfolio assessment feedback and invite for masterclass demo.',
        'pending',
        NULL,
        v_first_profile,
        now() - interval '2 days'
      ),
      -- COMPLETED TASK: completed yesterday
      (
        v_lead_4,
        v_first_profile,
        now() - interval '2 days',
        'Send welcome packet and onboarding portal credentials.',
        'completed',
        now() - interval '1 day',
        v_first_profile,
        now() - interval '4 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;

  -- 3. SEED AUDIT ACTIVITIES
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES
    (v_lead_1, v_first_profile, 'lead_created', 'New enquiry submitted via Website landing page.', '{"source": "Website"}'::jsonb, now() - interval '2 hours'),
    (v_lead_2, v_first_profile, 'lead_created', 'Lead created from in-person campus walk-in.', '{"source": "Walk-in"}'::jsonb, now() - interval '1 day'),
    (v_lead_2, v_first_profile, 'status_changed', 'Status changed from New to Contacted after campus briefing.', '{"previous_status": "New", "new_status": "Contacted"}'::jsonb, now() - interval '4 hours'),
    (v_lead_4, v_first_profile, 'status_changed', 'Status updated to Converted after successful enrollment fee receipt.', '{"previous_status": "Qualified", "new_status": "Converted"}'::jsonb, now() - interval '12 hours'),
    (v_lead_5, v_first_profile, 'status_changed', 'Status updated to Lost. Reason: Relocating to another city for university.', '{"previous_status": "Contacted", "new_status": "Lost", "reason": "Relocation"}'::jsonb, now() - interval '2 days')
  ON CONFLICT DO NOTHING;

END $$;

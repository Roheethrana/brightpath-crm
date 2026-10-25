import { supabase } from '../lib/supabaseClient';
import { FollowUp, FollowupStatus } from '../types/database.types';

// High-fidelity fallback follow-ups for local testing/offline mode
const FALLBACK_FOLLOWUPS: FollowUp[] = [
  {
    id: 'f-1',
    lead_id: '11111111-1111-1111-1111-111111111111',
    assigned_to: 'demo-1',
    // 2 days in the past -> Overdue
    due_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    note: 'Call student to explain syllabus & early bird discount details.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-1',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    lead: {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      course_interest: 'Full Stack Web Development',
      source: 'Website',
      status: 'New',
      lost_reason: null,
      assigned_to: null,
      created_by: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
    assignee: { id: 'demo-1', full_name: 'Pooja Verma', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
    id: 'f-2',
    lead_id: '22222222-2222-2222-2222-222222222222',
    assigned_to: 'demo-2',
    // 4 hours in the past -> Overdue
    due_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    note: 'Send Data Science curriculum brochure & schedule campus visit.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-2',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lead: {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 98234 56789',
      course_interest: 'Data Science & AI',
      source: 'Walk-in',
      status: 'Contacted',
      lost_reason: null,
      assigned_to: null,
      created_by: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
    assignee: { id: 'demo-2', full_name: 'Rohan Deshmukh', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
    id: 'f-3',
    lead_id: '33333333-3333-3333-3333-333333333333',
    assigned_to: 'demo-3',
    // Tomorrow -> Upcoming
    due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    note: 'Technical counselling session with faculty head for Cloud DevOps track.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-3',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lead: {
      id: '33333333-3333-3333-3333-333333333333',
      full_name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '+91 97123 45678',
      course_interest: 'Cloud & DevOps Engineering',
      source: 'Referral',
      status: 'Qualified',
      lost_reason: null,
      assigned_to: null,
      created_by: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
    assignee: { id: 'demo-3', full_name: 'Suresh Kumar', role: 'manager', created_at: '', updated_at: '' },
  },
  {
    id: 'f-4',
    lead_id: '44444444-4444-4444-4444-444444444444',
    assigned_to: 'demo-1',
    // 3 days in the past, completed
    due_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    note: 'Follow up on payment confirmation receipt and onboarding batch group.',
    status: 'completed',
    completed_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    created_by: 'demo-1',
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    lead: {
      id: '44444444-4444-4444-4444-444444444444',
      full_name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      phone: '+91 96543 21098',
      course_interest: 'UI/UX Design Masterclass',
      source: 'Social Media',
      status: 'Converted',
      lost_reason: null,
      assigned_to: null,
      created_by: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
    assignee: { id: 'demo-1', full_name: 'Pooja Verma', role: 'counsellor', created_at: '', updated_at: '' },
  },
];

/**
 * Filter followups by tab category
 * Overdue: status === 'pending' && due_at < now()
 * Upcoming: status === 'pending' && due_at >= now()
 * Completed: status === 'completed'
 */
export function categorizeFollowups(followups: FollowUp[]): {
  overdue: FollowUp[];
  upcoming: FollowUp[];
  completed: FollowUp[];
} {
  const now = new Date().getTime();
  const overdue: FollowUp[] = [];
  const upcoming: FollowUp[] = [];
  const completed: FollowUp[] = [];

  for (const f of followups) {
    if (f.status === 'completed') {
      completed.push(f);
    } else if (f.status === 'pending') {
      const dueTime = new Date(f.due_at).getTime();
      if (dueTime < now) {
        overdue.push(f);
      } else {
        upcoming.push(f);
      }
    }
  }

  // Sort upcoming ascending (soonest first)
  upcoming.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  // Sort overdue ascending (most overdue first)
  overdue.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  // Sort completed descending (most recently completed first)
  completed.sort(
    (a, b) =>
      new Date(b.completed_at || b.created_at).getTime() -
      new Date(a.completed_at || a.created_at).getTime()
  );

  return { overdue, upcoming, completed };
}

/**
 * Fetch all follow-ups with joined lead and assignee profiles
 */
export async function fetchFollowups(): Promise<{
  followups: FollowUp[];
  isFallback: boolean;
  error: string | null;
}> {
  if (!supabase) {
    return { followups: [...FALLBACK_FOLLOWUPS], isFallback: true, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('follow_ups')
      .select(`
        *,
        lead:lead_id (*),
        assignee:assigned_to (id, full_name, role)
      `)
      .order('due_at', { ascending: true });

    if (error) {
      console.warn('Supabase follow-ups fetch failed, falling back to mock:', error.message);
      return { followups: [...FALLBACK_FOLLOWUPS], isFallback: true, error: error.message };
    }

    return { followups: (data as unknown as FollowUp[]) || [], isFallback: false, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to query follow-ups';
    return { followups: [...FALLBACK_FOLLOWUPS], isFallback: true, error: msg };
  }
}

/**
 * Schedule a new follow-up and record activity audit log
 */
export async function scheduleFollowup(params: {
  lead_id: string;
  assigned_to: string;
  due_at: string;
  note: string;
}): Promise<{ followup: FollowUp | null; error: string | null }> {
  if (!supabase) {
    const newFollowup: FollowUp = {
      id: crypto.randomUUID(),
      lead_id: params.lead_id,
      assigned_to: params.assigned_to,
      due_at: params.due_at,
      note: params.note.trim(),
      status: 'pending',
      completed_at: null,
      created_by: 'demo-current-user',
      created_at: new Date().toISOString(),
      assignee: { id: params.assigned_to, full_name: 'Assigned Counsellor', role: 'counsellor', created_at: '', updated_at: '' },
    };
    FALLBACK_FOLLOWUPS.unshift(newFollowup);
    return { followup: newFollowup, error: null };
  }

  try {
    const userSession = await supabase.auth.getUser();
    const currentUserId = userSession.data.user?.id || null;

    const payload = {
      lead_id: params.lead_id,
      assigned_to: params.assigned_to,
      due_at: params.due_at,
      note: params.note.trim(),
      status: 'pending' as FollowupStatus,
      created_by: currentUserId,
    };

    const { data, error } = await supabase
      .from('follow_ups')
      .insert([payload])
      .select(`
        *,
        lead:lead_id (*),
        assignee:assigned_to (id, full_name, role)
      `)
      .single();

    if (error) {
      return { followup: null, error: error.message };
    }

    // Automatically record activity
    if (data?.id) {
      await supabase.from('activities').insert([
        {
          lead_id: params.lead_id,
          actor_id: currentUserId,
          activity_type: 'followup_created',
          description: `Follow-up scheduled for ${new Date(params.due_at).toLocaleDateString()}: "${params.note.trim()}"`,
          metadata: { followup_id: data.id, due_at: params.due_at },
        },
      ]);
    }

    return { followup: data as unknown as FollowUp, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to schedule follow-up';
    return { followup: null, error: msg };
  }
}

/**
 * Mark a follow-up as completed with an optional outcome note and record activity
 */
export async function completeFollowup(
  followupId: string,
  outcomeNote?: string | null
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    const target = FALLBACK_FOLLOWUPS.find((f) => f.id === followupId);
    if (target) {
      target.status = 'completed';
      target.completed_at = new Date().toISOString();
      if (outcomeNote?.trim()) {
        target.note = `${target.note}\n[Completed Outcome]: ${outcomeNote.trim()}`;
      }
    }
    return { success: true, error: null };
  }

  try {
    const userSession = await supabase.auth.getUser();
    const currentUserId = userSession.data.user?.id || null;

    // First fetch existing to get lead_id
    const { data: existing } = await supabase
      .from('follow_ups')
      .select('lead_id, note')
      .eq('id', followupId)
      .single();

    const updatedNote = outcomeNote?.trim()
      ? `${existing?.note || ''}\n[Completed]: ${outcomeNote.trim()}`
      : existing?.note;

    const { error } = await supabase
      .from('follow_ups')
      .update({
        status: 'completed' as FollowupStatus,
        completed_at: new Date().toISOString(),
        note: updatedNote,
      })
      .eq('id', followupId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Automatically record activity
    if (existing?.lead_id) {
      await supabase.from('activities').insert([
        {
          lead_id: existing.lead_id,
          actor_id: currentUserId,
          activity_type: 'followup_completed',
          description: outcomeNote?.trim()
            ? `Follow-up completed: "${outcomeNote.trim()}"`
            : 'Follow-up marked completed.',
          metadata: { followup_id: followupId },
        },
      ]);
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to complete follow-up';
    return { success: false, error: msg };
  }
}

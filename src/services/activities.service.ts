import { supabase } from '../lib/supabaseClient';
import { Activity, ActivityType } from '../types/database.types';

// In-memory fallback activity audit logs for local mock mode
const FALLBACK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    lead_id: '11111111-1111-1111-1111-111111111111',
    actor_id: 'demo-1',
    activity_type: 'lead_created',
    description: 'Enquiry captured for Full Stack Web Development via Website.',
    metadata: { source: 'Website', course: 'Full Stack Web Development' },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actor: { id: 'demo-1', full_name: 'Pooja Verma', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
    id: 'act-2',
    lead_id: '22222222-2222-2222-2222-222222222222',
    actor_id: 'demo-2',
    activity_type: 'lead_created',
    description: 'Enquiry captured for Data Science & AI via Walk-in.',
    metadata: { source: 'Walk-in' },
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actor: { id: 'demo-2', full_name: 'Rohan Deshmukh', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
    id: 'act-3',
    lead_id: '22222222-2222-2222-2222-222222222222',
    actor_id: 'demo-2',
    activity_type: 'status_changed',
    description: 'Status changed from New to Contacted.',
    metadata: { old_status: 'New', new_status: 'Contacted' },
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    actor: { id: 'demo-2', full_name: 'Rohan Deshmukh', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
    id: 'act-4',
    lead_id: '55555555-5555-5555-5555-555555555555',
    actor_id: null,
    activity_type: 'status_changed',
    description: 'Marked as Lost. Reason: Relocating to another city for university',
    metadata: { old_status: 'Contacted', new_status: 'Lost', lost_reason: 'Relocating to another city for university' },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actor: null,
  },
];

/**
 * Fetch timeline of activities for a specific lead
 */
export async function fetchLeadActivities(leadId: string): Promise<{
  activities: Activity[];
  error: string | null;
}> {
  if (!supabase) {
    const list = FALLBACK_ACTIVITIES.filter((a) => a.lead_id === leadId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { activities: list, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        actor:actor_id (id, full_name, role)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching activities:', error.message);
      const list = FALLBACK_ACTIVITIES.filter((a) => a.lead_id === leadId);
      return { activities: list, error: error.message };
    }

    return { activities: (data as unknown as Activity[]) || [], error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query activities';
    return { activities: [], error: message };
  }
}

/**
 * Record an activity event in the database
 */
export async function logActivity(params: {
  leadId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<{ activity: Activity | null; error: string | null }> {
  if (!supabase) {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      lead_id: params.leadId,
      actor_id: 'demo-current-user',
      activity_type: params.activityType,
      description: params.description,
      metadata: (params.metadata || {}) as any,
      created_at: new Date().toISOString(),
      actor: { id: 'demo-current-user', full_name: 'Current Counsellor', role: 'counsellor', created_at: '', updated_at: '' },
    };
    FALLBACK_ACTIVITIES.unshift(newActivity);
    return { activity: newActivity, error: null };
  }

  try {
    const userSession = await supabase.auth.getUser();
    const currentUserId = userSession.data.user?.id || null;

    const payload = {
      lead_id: params.leadId,
      actor_id: currentUserId,
      activity_type: params.activityType,
      description: params.description,
      metadata: params.metadata || {},
    };

    const { data, error } = await supabase
      .from('activities')
      .insert([payload])
      .select(`
        *,
        actor:actor_id (id, full_name, role)
      `)
      .single();

    if (error) {
      return { activity: null, error: error.message };
    }

    return { activity: data as unknown as Activity, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record activity';
    return { activity: null, error: message };
  }
}

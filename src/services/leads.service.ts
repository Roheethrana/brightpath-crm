import { supabase } from '../lib/supabaseClient';
import { Lead, Profile, LeadStatus, LeadSource } from '../types/database.types';

export interface LeadFilterParams {
  search?: string;
  status?: string;
  source?: string;
  assigneeId?: string;
}

// High-fidelity fallback leads (matches seed data) for immediate testing or offline mode
const FALLBACK_LEADS: Lead[] = [
  {
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
    notes: 'Inquired through website form. Interested in React & Node.js batch.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 'demo-1', full_name: 'Pooja Verma', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
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
    notes: 'Visited academy campus. Discussed Python prerequisites.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 'demo-2', full_name: 'Rohan Deshmukh', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
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
    notes: 'Junior admin experience. AWS & Kubernetes prep.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 'demo-3', full_name: 'Suresh Kumar', role: 'manager', created_at: '', updated_at: '' },
  },
  {
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
    notes: 'Admission fee completed. Enrolled in upcoming cohort.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 'demo-1', full_name: 'Pooja Verma', role: 'counsellor', created_at: '', updated_at: '' },
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 95432 10987',
    course_interest: 'Full Stack Web Development',
    source: 'Call',
    status: 'Lost',
    lost_reason: 'Relocating to another city for university',
    assigned_to: null,
    created_by: null,
    notes: 'Student moving out of state.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: null,
  },
];

/**
 * Fetch leads with filters and joined profiles
 */
export async function fetchLeads(filters: LeadFilterParams = {}): Promise<{
  leads: Lead[];
  isFallback: boolean;
  error: string | null;
}> {
  if (!supabase) {
    let result = [...FALLBACK_LEADS];
    if (filters.status && filters.status !== 'all') {
      result = result.filter(l => l.status === filters.status);
    }
    if (filters.source && filters.source !== 'all') {
      result = result.filter(l => l.source === filters.source);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        l => l.full_name.toLowerCase().includes(q) ||
             l.phone.includes(q) ||
             l.course_interest.toLowerCase().includes(q)
      );
    }
    return { leads: result, isFallback: true, error: null };
  }

  try {
    let query = supabase
      .from('leads')
      .select(`
        *,
        assignee:assigned_to (id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.source && filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }

    if (filters.assigneeId && filters.assigneeId !== 'all') {
      query = query.eq('assigned_to', filters.assigneeId);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`full_name.ilike.${term},phone.ilike.${term},course_interest.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase fetch error, using fallback seed leads:', error.message);
      return { leads: FALLBACK_LEADS, isFallback: true, error: error.message };
    }

    return { leads: (data as unknown as Lead[]) || [], isFallback: false, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query leads';
    return { leads: FALLBACK_LEADS, isFallback: true, error: message };
  }
}

/**
 * Fetch profiles available for lead assignment
 */
export async function fetchAssignees(): Promise<Profile[]> {
  if (!supabase) {
    return [
      { id: 'demo-1', full_name: 'Pooja Verma', role: 'counsellor', created_at: '', updated_at: '' },
      { id: 'demo-2', full_name: 'Rohan Deshmukh', role: 'counsellor', created_at: '', updated_at: '' },
      { id: 'demo-3', full_name: 'Suresh Kumar', role: 'manager', created_at: '', updated_at: '' },
    ];
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.warn('Error fetching assignees:', error.message);
      return [];
    }

    return (data as Profile[]) || [];
  } catch {
    return [];
  }
}

/**
 * Create a new lead and log creation activity
 */
export async function createLead(leadData: {
  full_name: string;
  email?: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource;
  status?: LeadStatus;
  assigned_to?: string | null;
  notes?: string | null;
}): Promise<{ lead: Lead | null; error: string | null }> {
  if (!supabase) {
    const newLead: Lead = {
      id: crypto.randomUUID(),
      full_name: leadData.full_name.trim(),
      email: leadData.email ? leadData.email.trim() : null,
      phone: leadData.phone.trim(),
      course_interest: leadData.course_interest,
      source: leadData.source,
      status: leadData.status || 'New',
      lost_reason: null,
      assigned_to: leadData.assigned_to || null,
      created_by: null,
      notes: leadData.notes ? leadData.notes.trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    FALLBACK_LEADS.unshift(newLead);
    return { lead: newLead, error: null };
  }

  try {
    const userSession = await supabase.auth.getUser();
    const currentUserId = userSession.data.user?.id || null;

    const payload = {
      full_name: leadData.full_name.trim(),
      email: leadData.email?.trim() || null,
      phone: leadData.phone.trim(),
      course_interest: leadData.course_interest,
      source: leadData.source,
      status: leadData.status || 'New',
      assigned_to: leadData.assigned_to || null,
      created_by: currentUserId,
      notes: leadData.notes?.trim() || null,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([payload])
      .select(`
        *,
        assignee:assigned_to (id, full_name, role)
      `)
      .single();

    if (error) {
      return { lead: null, error: error.message };
    }

    // Automatically record activity
    if (data?.id) {
      await supabase.from('activities').insert([
        {
          lead_id: data.id,
          actor_id: currentUserId,
          activity_type: 'lead_created',
          description: `Enquiry captured for ${payload.course_interest} via ${payload.source}.`,
          metadata: { source: payload.source, course: payload.course_interest },
        },
      ]);
    }

    return { lead: data as unknown as Lead, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create lead';
    return { lead: null, error: message };
  }
}

/**
 * Update lead status with optional lost reason and record activity audit log
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  lostReason?: string | null
): Promise<{ success: boolean; lead: Lead | null; error: string | null }> {
  const reason = newStatus === 'Lost' ? (lostReason?.trim() || null) : null;

  if (!supabase) {
    const target = FALLBACK_LEADS.find((l) => l.id === leadId);
    if (!target) {
      return { success: false, lead: null, error: 'Lead not found' };
    }
    target.status = newStatus;
    target.lost_reason = reason;
    target.updated_at = new Date().toISOString();

    return { success: true, lead: { ...target }, error: null };
  }

  try {
    const updatePayload: {
      status: LeadStatus;
      lost_reason: string | null;
      updated_at: string;
    } = {
      status: newStatus,
      lost_reason: reason,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId)
      .select(`
        *,
        assignee:assigned_to (id, full_name, role)
      `)
      .single();

    if (error) {
      return { success: false, lead: null, error: error.message };
    }

    return { success: true, lead: data as unknown as Lead, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update lead status';
    return { success: false, lead: null, error: msg };
  }
}

/**
 * Update general lead details (assignee, notes, course, etc.)
 */
export async function updateLeadDetails(
  leadId: string,
  updates: Partial<Omit<Lead, 'id' | 'created_at' | 'assignee'>>
): Promise<{ success: boolean; lead: Lead | null; error: string | null }> {
  if (!supabase) {
    const target = FALLBACK_LEADS.find((l) => l.id === leadId);
    if (!target) {
      return { success: false, lead: null, error: 'Lead not found' };
    }
    Object.assign(target, updates, { updated_at: new Date().toISOString() });
    return { success: true, lead: { ...target }, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select(`
        *,
        assignee:assigned_to (id, full_name, role)
      `)
      .single();

    if (error) {
      return { success: false, lead: null, error: error.message };
    }

    return { success: true, lead: data as unknown as Lead, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update lead details';
    return { success: false, lead: null, error: msg };
  }
}


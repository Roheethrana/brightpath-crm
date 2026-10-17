export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'manager' | 'counsellor';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type LeadSource =
  | 'Website'
  | 'Walk-in'
  | 'Call'
  | 'Referral'
  | 'Social Media'
  | 'Other';

export type FollowupStatus = 'pending' | 'completed' | 'cancelled';

export type ActivityType =
  | 'lead_created'
  | 'status_changed'
  | 'followup_created'
  | 'followup_completed'
  | 'note_added';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource;
  status: LeadStatus;
  lost_reason: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for display
  assignee?: Profile | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string;
  due_at: string;
  note: string;
  status: FollowupStatus;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  // Joined fields for display
  lead?: Lead | null;
  assignee?: Profile | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  actor_id: string | null;
  activity_type: ActivityType;
  description: string;
  metadata: Record<string, Json>;
  created_at: string;
  // Joined fields for display
  actor?: Profile | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          updated_at?: string;
        };
      };
      leads: {
        Row: Lead;
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone: string;
          course_interest: string;
          source: LeadSource;
          status?: LeadStatus;
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string;
          course_interest?: string;
          source?: LeadSource;
          status?: LeadStatus;
          lost_reason?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      follow_ups: {
        Row: FollowUp;
        Insert: {
          id?: string;
          lead_id: string;
          assigned_to: string;
          due_at: string;
          note: string;
          status?: FollowupStatus;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          lead_id?: string;
          assigned_to?: string;
          due_at?: string;
          note?: string;
          status?: FollowupStatus;
          completed_at?: string | null;
        };
      };
      activities: {
        Row: Activity;
        Insert: {
          id?: string;
          lead_id: string;
          actor_id?: string | null;
          activity_type: ActivityType;
          description: string;
          metadata?: Record<string, Json>;
          created_at?: string;
        };
        Update: {
          description?: string;
          metadata?: Record<string, Json>;
        };
      };
    };
  };
}

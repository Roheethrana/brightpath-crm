import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Clock, Plus, RefreshCw, Database } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FollowupsList } from './FollowupsList';
import { ScheduleFollowupModal } from './ScheduleFollowupModal';
import { FollowUp, Lead, Profile } from '../../types/database.types';
import { fetchFollowups, categorizeFollowups, scheduleFollowup, completeFollowup } from '../../services/followups.service';
import { fetchLeads, fetchAssignees } from '../../services/leads.service';

interface FollowupsPageProps {
  onNavigateToLead?: (leadId: string) => void;
}

type FollowupTab = 'overdue' | 'upcoming' | 'completed';

export const FollowupsPage: React.FC<FollowupsPageProps> = ({ onNavigateToLead }) => {
  const [activeTab, setActiveTab] = useState<FollowupTab>('upcoming');
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assignees, setAssignees] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  // Load assignees and leads for scheduling dropdowns
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchAssignees(), fetchLeads()]).then(([profiles, leadsRes]) => {
      if (isMounted) {
        setAssignees(profiles);
        setLeads(leadsRes.leads);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch all follow-ups
  const loadFollowups = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { followups: data, isFallback, error } = await fetchFollowups();
      setFollowups(data);
      setIsFallbackMode(isFallback);
      if (error) {
        setErrorMessage(error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query follow-ups';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowups();
  }, [loadFollowups]);

  // Compute segmented lists
  const { overdue, upcoming, completed } = categorizeFollowups(followups);

  const getActiveList = (): FollowUp[] => {
    switch (activeTab) {
      case 'overdue':
        return overdue;
      case 'upcoming':
        return upcoming;
      case 'completed':
        return completed;
      default:
        return [];
    }
  };

  const handleScheduleSave = async (params: {
    lead_id: string;
    assigned_to: string;
    due_at: string;
    note: string;
  }) => {
    const { followup, error } = await scheduleFollowup(params);
    if (error || !followup) {
      return { success: false, error: error || 'Failed to schedule follow-up' };
    }

    await loadFollowups();
    return { success: true };
  };

  const handleComplete = async (followupId: string, outcomeNote?: string) => {
    const { success, error } = await completeFollowup(followupId, outcomeNote);
    if (success) {
      await loadFollowups();
    } else if (error) {
      setErrorMessage(error);
    }
  };

  return (
    <div>
      {/* Fallback Beacon */}
      {isFallbackMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} color="var(--color-accent)" />
            <span>
              <strong>Local Mock Mode:</strong> Displaying high-fidelity seed follow-ups. Real-time updates automatically sync to Supabase when credentials are provided.
            </span>
          </div>
          <button
            onClick={() => loadFollowups()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#991b1b',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Follow-up Tasks
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Maintain continuous communication with students. Never miss an overdue enquiry.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => loadFollowups()} icon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsScheduleModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Schedule Follow-up
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Upcoming */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'upcoming' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'upcoming' ? '#ffffff' : 'var(--color-text-muted)',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
          }}
        >
          <Clock size={16} />
          Upcoming Tasks ({upcoming.length})
        </button>

        {/* Overdue */}
        <button
          onClick={() => setActiveTab('overdue')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'overdue' ? '#e11d48' : 'transparent',
            color: activeTab === 'overdue' ? '#ffffff' : overdue.length > 0 ? '#e11d48' : 'var(--color-text-muted)',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} />
          Overdue Tasks ({overdue.length})
        </button>

        {/* Completed */}
        <button
          onClick={() => setActiveTab('completed')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'completed' ? '#059669' : 'transparent',
            color: activeTab === 'completed' ? '#ffffff' : 'var(--color-text-muted)',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} />
          Completed ({completed.length})
        </button>
      </div>

      {/* Task List Container */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <FollowupsList
          followups={getActiveList()}
          tab={activeTab}
          isLoading={isLoading}
          onComplete={handleComplete}
          onNavigateToLead={onNavigateToLead}
        />
      </Card>

      {/* Schedule Modal */}
      <ScheduleFollowupModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleScheduleSave}
        leads={leads}
        assignees={assignees}
      />
    </div>
  );
};

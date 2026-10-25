import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, UserPlus, Database, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getSupabaseConfigStatus } from '../../lib/supabaseClient';
import { DashboardKPIs } from './DashboardKPIs';
import { LeadsByStatusChart } from './LeadsByStatusChart';
import { LeadsBySourceChart } from './LeadsBySourceChart';
import { OverdueFollowupsWidget } from './OverdueFollowupsWidget';
import { Lead, FollowUp } from '../../types/database.types';
import { fetchLeads } from '../../services/leads.service';
import { fetchFollowups, categorizeFollowups } from '../../services/followups.service';

interface DashboardPageProps {
  onNavigateToLeads: () => void;
  onNavigateToFollowups: () => void;
  onOpenSetupModal: () => void;
  onNavigateToLead?: (leadId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToLeads,
  onNavigateToFollowups,
  onOpenSetupModal,
  onNavigateToLead,
}) => {
  const config = getSupabaseConfigStatus();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [leadsRes, followupsRes] = await Promise.all([
        fetchLeads(),
        fetchFollowups(),
      ]);

      setLeads(leadsRes.leads);
      setFollowups(followupsRes.followups);
      setIsFallbackMode(leadsRes.isFallback || followupsRes.isFallback);

      if (leadsRes.error || followupsRes.error) {
        setErrorMessage(leadsRes.error || followupsRes.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh dashboard';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Compute reconciled KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted').length;

  const { overdue } = categorizeFollowups(followups);
  const overdueCount = overdue.length;

  return (
    <div>
      {/* Supabase Disconnected Banner */}
      {!config.isConfigured && (
        <div
          style={{
            marginBottom: '1.75rem',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            border: '1px solid #1e293b',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Supabase Backend Not Connected
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Add your Project URL and Anon Key in <code>.env</code> to connect live authentication and database persistence.
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={onOpenSetupModal}
            icon={<ArrowRight size={16} />}
            style={{ fontSize: '0.85rem' }}
          >
            Connect Supabase
          </Button>
        </div>
      )}

      {/* Error alert if any */}
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

      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Academy Pipeline Overview
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time enquiry tracking, conversion metrics, and scheduled follow-ups.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => loadDashboardData()}
            disabled={isLoading}
            icon={<RefreshCw size={15} />}
          >
            Refresh
          </Button>
          <Button variant="secondary" onClick={onNavigateToFollowups} icon={<Calendar size={16} />}>
            View Schedule
          </Button>
          <Button variant="primary" onClick={onNavigateToLeads} icon={<UserPlus size={16} />}>
            New Enquiry
          </Button>
        </div>
      </div>

      {/* Reconciled KPI Cards Grid */}
      <DashboardKPIs
        totalLeads={totalLeads}
        newLeads={newLeads}
        convertedLeads={convertedLeads}
        overdueCount={overdueCount}
        isLiveSync={config.isConfigured && !isFallbackMode}
      />

      {/* Charts & Breakdown Section */}
      <div className="grid-two-col" style={{ marginTop: '1.5rem' }}>
        {/* Pipeline Distribution */}
        <LeadsByStatusChart leads={leads} />

        {/* Overdue Follow-ups Widget */}
        <OverdueFollowupsWidget
          overdueTasks={overdue}
          onNavigateToFollowups={onNavigateToFollowups}
          onNavigateToLead={onNavigateToLead}
        />
      </div>

      {/* Channel Performance Full Width Grid */}
      <div style={{ marginTop: '1.5rem' }}>
        <LeadsBySourceChart leads={leads} />
      </div>
    </div>
  );
};

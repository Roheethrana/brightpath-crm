import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LeadTable } from './LeadTable';
import { LeadFiltersBar } from './LeadFiltersBar';
import { CreateLeadModal } from './CreateLeadModal';
import { Lead, Profile, LeadStatus, LeadSource } from '../../types/database.types';
import { fetchLeads, fetchAssignees, createLead } from '../../services/leads.service';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assignees, setAssignees] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load assignees on mount
  useEffect(() => {
    let mounted = true;
    fetchAssignees().then((profiles) => {
      if (mounted) setAssignees(profiles);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch leads when filters change
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { leads: data, isFallback, error } = await fetchLeads({
        search: searchTerm,
        status: selectedStatus,
        source: selectedSource,
        assigneeId: selectedAssignee,
      });

      setLeads(data);
      setIsFallbackMode(isFallback);
      if (error) {
        setErrorMessage(error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedSource, selectedAssignee]);

  // Debounced trigger for search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadLeads]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedSource('all');
    setSelectedAssignee('all');
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedStatus !== 'all' || selectedSource !== 'all' || selectedAssignee !== 'all'
  );

  const handleSaveLead = async (leadData: {
    full_name: string;
    email?: string | null;
    phone: string;
    course_interest: string;
    source: LeadSource;
    status: LeadStatus;
    assigned_to?: string | null;
    notes?: string | null;
  }) => {
    const { lead, error } = await createLead(leadData);
    if (error || !lead) {
      return { success: false, error: error || 'Failed to create lead' };
    }

    // Refresh lead list immediately
    await loadLeads();
    return { success: true };
  };

  return (
    <div>
      {/* Top Banner if in Local Fallback Mode */}
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
              <strong>Local Mock Mode:</strong> Displaying high-fidelity seed enquiries. When Supabase is configured with keys, records automatically synchronize to PostgreSQL.
            </span>
          </div>
          <button
            onClick={() => loadLeads()}
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

      {/* Page Header */}
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
            Student Enquiries
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Capture, qualify, and convert enquiries into active admissions. ({leads.length} {leads.length === 1 ? 'enquiry' : 'enquiries'})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => loadLeads()} icon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <LeadFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        assignees={assignees}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Leads Table Container */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          onSelectLead={(lead) => {
            console.log('Selected lead:', lead.id);
          }}
        />
      </Card>

      {/* Add New Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveLead}
        assignees={assignees}
      />
    </div>
  );
};

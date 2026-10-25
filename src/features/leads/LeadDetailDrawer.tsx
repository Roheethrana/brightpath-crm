import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, AlertTriangle, Send, Check } from 'lucide-react';
import { Lead, Profile, LeadStatus, Activity } from '../../types/database.types';
import { Badge, BadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ActivityTimeline } from './ActivityTimeline';
import { LostReasonModal } from './LostReasonModal';
import { updateLeadStatus, updateLeadDetails } from '../../services/leads.service';
import { fetchLeadActivities, logActivity } from '../../services/activities.service';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
  assignees: Profile[];
}

const STATUS_STEPS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'new';
    case 'contacted':
      return 'contacted';
    case 'qualified':
      return 'qualified';
    case 'converted':
      return 'converted';
    case 'lost':
      return 'lost';
    default:
      return 'neutral';
  }
};

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  assignees,
}) => {
  const [currentLead, setCurrentLead] = useState<Lead | null>(lead);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);

  // Status transition state
  const [isLostModalOpen, setIsLostModalOpen] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  // New Note state
  const [newNote, setNewNote] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Sync state when selected lead prop changes
  useEffect(() => {
    setCurrentLead(lead);
    if (lead?.id) {
      loadActivities(lead.id);
    }
  }, [lead]);

  const loadActivities = async (leadId: string) => {
    setIsLoadingActivities(true);
    const { activities: data } = await fetchLeadActivities(leadId);
    setActivities(data);
    setIsLoadingActivities(false);
  };

  if (!isOpen || !currentLead) return null;

  const handleStatusChangeClick = (newStatus: LeadStatus) => {
    if (newStatus === currentLead.status) return;

    if (newStatus === 'Lost') {
      setIsLostModalOpen(true);
    } else {
      applyStatusChange(newStatus, null);
    }
  };

  const applyStatusChange = async (newStatus: LeadStatus, reason: string | null) => {
    if (!currentLead) return;
    setStatusUpdating(true);
    try {
      const oldStatus = currentLead.status;
      const result = await updateLeadStatus(currentLead.id, newStatus, reason);

      if (result.success && result.lead) {
        // Record timeline activity
        const desc = newStatus === 'Lost'
          ? `Marked as Lost. Reason: ${reason}`
          : `Status advanced from ${oldStatus} to ${newStatus}.`;

        await logActivity({
          leadId: currentLead.id,
          activityType: 'status_changed',
          description: desc,
          metadata: { old_status: oldStatus, new_status: newStatus, lost_reason: reason },
        });

        setCurrentLead(result.lead);
        onLeadUpdated(result.lead);
        await loadActivities(currentLead.id);
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !currentLead) return;

    setIsAddingNote(true);
    try {
      const trimmed = newNote.trim();
      const updatedNotes = currentLead.notes ? `${currentLead.notes}\n• ${trimmed}` : trimmed;

      await updateLeadDetails(currentLead.id, { notes: updatedNotes });

      await logActivity({
        leadId: currentLead.id,
        activityType: 'note_added',
        description: `Note added: "${trimmed}"`,
      });

      const updated = { ...currentLead, notes: updatedNotes };
      setCurrentLead(updated);
      onLeadUpdated(updated);
      setNewNote('');
      await loadActivities(currentLead.id);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!currentLead) return;
    const assigneeId = newAssigneeId || null;
    const targetAssignee = assignees.find((a) => a.id === assigneeId);

    const result = await updateLeadDetails(currentLead.id, { assigned_to: assigneeId });
    if (result.success && result.lead) {
      await logActivity({
        leadId: currentLead.id,
        activityType: 'note_added',
        description: targetAssignee
          ? `Reassigned enquiry to ${targetAssignee.full_name} (${targetAssignee.role}).`
          : 'Enquiry unassigned.',
      });

      const fullUpdated: Lead = {
        ...result.lead,
        assignee: targetAssignee || null,
      };
      setCurrentLead(fullUpdated);
      onLeadUpdated(fullUpdated);
      await loadActivities(currentLead.id);
    }
  };

  return (
    <>
      {/* Background Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 40,
        }}
        onClick={onClose}
      />

      {/* Side Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Badge variant={getStatusBadgeVariant(currentLead.status)}>
                {currentLead.status}
              </Badge>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                }}
              >
                {currentLead.source}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {currentLead.full_name}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Inquired for: <strong>{currentLead.course_interest}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-subtle)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Status Pipeline Transition Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              Pipeline Stage & Status
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {STATUS_STEPS.map((step) => {
                const isActive = currentLead.status === step;
                return (
                  <button
                    key={step}
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChangeClick(step)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: statusUpdating ? 'not-allowed' : 'pointer',
                      border: isActive ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-main)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isActive && <Check size={12} />}
                    {step}
                  </button>
                );
              })}
            </div>

            {/* Lost Reason Display Banner if Status is Lost */}
            {currentLead.status === 'Lost' && currentLead.lost_reason && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Lost Reason Documented:</strong>
                  <div style={{ marginTop: '0.2rem' }}>{currentLead.lost_reason}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Contact & Assignment Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Phone */}
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'block', marginBottom: '0.25rem' }}>Phone Number</span>
              <a
                href={`tel:${currentLead.phone}`}
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Phone size={14} />
                {currentLead.phone}
              </a>
            </div>

            {/* Email */}
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'block', marginBottom: '0.25rem' }}>Email Address</span>
              {currentLead.email ? (
                <a
                  href={`mailto:${currentLead.email}`}
                  style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={currentLead.email}
                >
                  <Mail size={14} />
                  {currentLead.email}
                </a>
              ) : (
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not provided</span>
              )}
            </div>

            {/* Assignee */}
            <div style={{ gridColumn: 'span 2', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'block', marginBottom: '0.35rem' }}>
                Assigned Counsellor
              </label>
              <select
                value={currentLead.assigned_to || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">-- Unassigned --</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Enquiry Notes
            </h4>
            {currentLead.notes ? (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-main)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                  marginBottom: '0.75rem',
                }}
              >
                {currentLead.notes}
              </div>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                No initial notes recorded.
              </p>
            )}

            {/* Add note input */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Log discussion notes, student query, next steps..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
              <Button variant="primary" type="submit" disabled={isAddingNote || !newNote.trim()} icon={<Send size={13} />}>
                Add Note
              </Button>
            </form>
          </div>

          {/* Activity Audit Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Activity & Audit History
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                {activities.length} {activities.length === 1 ? 'event' : 'events'}
              </span>
            </div>
            <ActivityTimeline activities={activities} isLoading={isLoadingActivities} />
          </div>
        </div>
      </div>

      {/* Mandatory Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        studentName={currentLead.full_name}
        onClose={() => setIsLostModalOpen(false)}
        onConfirm={async (reason) => {
          await applyStatusChange('Lost', reason);
        }}
      />
    </>
  );
};

import React, { useState } from 'react';
import { X, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Lead, Profile } from '../../types/database.types';
import { Button } from '../../components/common/Button';

interface ScheduleFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: {
    lead_id: string;
    assigned_to: string;
    due_at: string;
    note: string;
  }) => Promise<{ success: boolean; error?: string }>;
  leads: Lead[];
  assignees: Profile[];
  initialLeadId?: string;
}

export const ScheduleFollowupModal: React.FC<ScheduleFollowupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leads,
  assignees,
  initialLeadId,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId || leads[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState<string>(assignees[0]?.id || '');

  // Default to tomorrow 10:00 AM
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [dueDate, setDueDate] = useState<string>(defaultDateStr);
  const [dueTime, setDueTime] = useState<string>('10:00');

  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!selectedLeadId) {
      errs.lead = 'Please select a student enquiry';
    }

    if (!assignedTo) {
      errs.assignedTo = 'Please assign a counsellor';
    }

    if (!dueDate) {
      errs.dueDate = 'Due date is required';
    }

    if (!note.trim()) {
      errs.note = 'Follow-up objective or discussion note is required';
    } else if (note.trim().length < 5) {
      errs.note = 'Note must be at least 5 characters long';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Combine date and time
      const combinedIso = new Date(`${dueDate}T${dueTime || '09:00'}:00`).toISOString();

      const result = await onSave({
        lead_id: selectedLeadId,
        assigned_to: assignedTo,
        due_at: combinedIso,
        note: note.trim(),
      });

      if (result.success) {
        setNote('');
        onClose();
      } else {
        setServerError(result.error || 'Failed to schedule follow-up');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected scheduling error';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Schedule Follow-up Task
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Plan a call, campus visit, or counselling session with a student.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-subtle)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {serverError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                color: '#991b1b',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Select Lead */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              Select Student Lead <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.lead ? 'var(--color-danger)' : 'var(--color-border)'}`,
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              {leads.length === 0 && <option value="">No leads available</option>}
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.full_name} — {l.course_interest} ({l.phone})
                </option>
              ))}
            </select>
            {errors.lead && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.lead}</p>}
          </div>

          {/* Assignee */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              Assigned Counsellor <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${errors.assignedTo ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
            {errors.assignedTo && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.assignedTo}</p>}
          </div>

          {/* Date and Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                Follow-up Date <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${errors.dueDate ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
              {errors.dueDate && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.dueDate}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                Target Time
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              Action Note & Purpose <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                rows={3}
                placeholder="e.g. Call to discuss course curriculum, clarify fee installments, and invite for weekend batch demo..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${errors.note ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
            {errors.note && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.note}</p>}
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Confirm Follow-up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

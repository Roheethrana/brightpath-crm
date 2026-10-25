import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Phone, User, AlertCircle, ArrowUpRight } from 'lucide-react';
import { FollowUp } from '../../types/database.types';
import { Button } from '../../components/common/Button';

interface FollowupsListProps {
  followups: FollowUp[];
  tab: 'overdue' | 'upcoming' | 'completed';
  isLoading: boolean;
  onComplete: (followupId: string, outcomeNote?: string) => Promise<void>;
  onNavigateToLead?: (leadId: string) => void;
}

export const FollowupsList: React.FC<FollowupsListProps> = ({
  followups,
  tab,
  isLoading,
  onComplete,
  onNavigateToLead,
}) => {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeOutcomeId, setActiveOutcomeId] = useState<string | null>(null);
  const [outcomeNote, setOutcomeNote] = useState<string>('');

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-box" style={{ width: '160px', height: '20px' }} />
              <div className="skeleton-box" style={{ width: '80px', height: '28px' }} />
            </div>
            <div className="skeleton-box" style={{ width: '100%', height: '36px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-box" style={{ width: '180px', height: '14px' }} />
              <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (followups.length === 0) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: tab === 'overdue' ? '#fff1f2' : tab === 'upcoming' ? '#eff6ff' : '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tab === 'overdue' ? '#e11d48' : tab === 'upcoming' ? 'var(--color-accent)' : '#059669',
            margin: '0 auto 1rem',
          }}
        >
          {tab === 'overdue' ? <AlertCircle size={24} /> : tab === 'upcoming' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1.05rem' }}>
          {tab === 'overdue'
            ? 'Zero Overdue Follow-ups!'
            : tab === 'upcoming'
            ? 'No Upcoming Follow-ups Scheduled'
            : 'No Completed Follow-ups Yet'}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0.35rem auto 0' }}>
          {tab === 'overdue'
            ? 'Great job keeping up with all student interactions on time.'
            : tab === 'upcoming'
            ? 'Use the Schedule Follow-up button to plan touchpoints with students.'
            : 'Tasks completed by counsellors will be documented here with timestamps and audit records.'}
        </p>
      </div>
    );
  }

  const handleCompleteSubmit = async (followupId: string) => {
    setCompletingId(followupId);
    try {
      await onComplete(followupId, outcomeNote.trim() || undefined);
      setActiveOutcomeId(null);
      setOutcomeNote('');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem' }}>
      {followups.map((f) => {
        const dueDate = new Date(f.due_at);
        const isPastDue = f.status === 'pending' && dueDate.getTime() < Date.now();
        const dateFormatted = format(dueDate, 'EEE, MMM dd, yyyy • h:mm a');
        const isOutcomeActive = activeOutcomeId === f.id;

        return (
          <div
            key={f.id}
            style={{
              backgroundColor: '#ffffff',
              border: isPastDue ? '1px solid #fecaca' : '1px solid var(--color-border)',
              borderLeft: isPastDue
                ? '4px solid var(--color-danger)'
                : f.status === 'completed'
                ? '4px solid #059669'
                : '4px solid var(--color-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Top row: Student Name, Course, Due Date badge, Action */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    {f.lead?.full_name || 'Enquiry Prospect'}
                  </span>

                  {f.lead && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                      }}
                    >
                      {f.lead.course_interest}
                    </span>
                  )}

                  {isPastDue && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: '#fef2f2',
                        color: '#991b1b',
                      }}
                    >
                      <AlertCircle size={12} />
                      OVERDUE
                    </span>
                  )}

                  {f.status === 'completed' && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  )}
                </div>

                {f.lead?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <Phone size={13} />
                    <span>{f.lead.phone}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {f.lead_id && onNavigateToLead && (
                  <Button
                    variant="ghost"
                    onClick={() => onNavigateToLead(f.lead_id)}
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    icon={<ArrowUpRight size={13} />}
                  >
                    View Lead
                  </Button>
                )}

                {f.status === 'pending' && (
                  <Button
                    variant="primary"
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.4rem 0.85rem',
                      backgroundColor: '#059669',
                      borderColor: '#059669',
                    }}
                    onClick={() => setActiveOutcomeId(isOutcomeActive ? null : f.id)}
                    icon={<CheckCircle2 size={14} />}
                  >
                    Mark Done
                  </Button>
                )}
              </div>
            </div>

            {/* Note text */}
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {f.note}
            </div>

            {/* Bottom meta row: Due date, Assignee */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} color={isPastDue ? '#e11d48' : 'var(--color-text-subtle)'} />
                <span style={{ fontWeight: isPastDue ? 600 : 400, color: isPastDue ? '#e11d48' : 'inherit' }}>
                  {f.status === 'completed' && f.completed_at
                    ? `Completed on ${format(new Date(f.completed_at), 'MMM dd, yyyy • h:mm a')}`
                    : `Due: ${dateFormatted}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} color="var(--color-text-subtle)" />
                <span>Assigned to: <strong>{f.assignee?.full_name || 'Counsellor'}</strong></span>
              </div>
            </div>

            {/* One-click outcome note drawer/input */}
            {isOutcomeActive && (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.875rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#166534' }}>
                  Discussion Outcome & Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student answered, confirmed attendance for Saturday demo session..."
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #86efac',
                    fontSize: '0.8125rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="ghost" onClick={() => setActiveOutcomeId(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={completingId === f.id}
                    onClick={() => handleCompleteSubmit(f.id)}
                    style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}
                  >
                    {completingId === f.id ? 'Completing...' : 'Confirm Completion'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

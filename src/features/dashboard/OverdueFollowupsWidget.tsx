import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, Clock, ArrowRight, User } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FollowUp } from '../../types/database.types';

interface OverdueFollowupsWidgetProps {
  overdueTasks: FollowUp[];
  onNavigateToFollowups: () => void;
  onNavigateToLead?: (leadId: string) => void;
}

export const OverdueFollowupsWidget: React.FC<OverdueFollowupsWidgetProps> = ({
  overdueTasks,
  onNavigateToFollowups,
  onNavigateToLead,
}) => {
  return (
    <Card
      title="Urgent & Overdue Follow-ups"
      subtitle="Pending tasks past their scheduled due time"
      action={
        <Button
          variant="ghost"
          onClick={onNavigateToFollowups}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          icon={<ArrowRight size={13} />}
        >
          View All ({overdueTasks.length})
        </Button>
      }
    >
      {overdueTasks.length === 0 ? (
        <div
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <Clock size={32} style={{ color: '#059669', marginBottom: '0.5rem', opacity: 0.8 }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
            Zero Overdue Tasks
          </div>
          <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            All student follow-ups are up to date! Great job maintaining proactive admissions outreach.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {overdueTasks.slice(0, 4).map((task) => {
            const dueDate = new Date(task.due_at);
            return (
              <div
                key={task.id}
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecaca',
                  borderLeft: '4px solid var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b' }}>
                      {task.lead?.full_name || 'Student Enquiry'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '9999px',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                      }}
                    >
                      OVERDUE
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-main)',
                      marginTop: '0.25rem',
                      marginBottom: '0.35rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {task.note}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#b91c1c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={12} />
                      <span>Due: {format(dueDate, 'MMM dd, h:mm a')}</span>
                    </div>
                    {task.assignee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-subtle)' }}>
                        <User size={12} />
                        <span>{task.assignee.full_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
                  <Button
                    variant="danger"
                    onClick={onNavigateToFollowups}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    Act Now
                  </Button>
                  {task.lead_id && onNavigateToLead && (
                    <Button
                      variant="ghost"
                      onClick={() => onNavigateToLead(task.lead_id)}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      Lead
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

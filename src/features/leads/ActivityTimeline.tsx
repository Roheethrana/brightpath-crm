import React from 'react';
import { format } from 'date-fns';
import { Activity } from '../../types/database.types';
import { Clock, CheckCircle2, CalendarPlus, UserCheck, MessageSquare } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'lead_created':
      return <UserCheck size={14} color="#2563eb" />;
    case 'status_changed':
      return <CheckCircle2 size={14} color="#059669" />;
    case 'followup_created':
      return <CalendarPlus size={14} color="#d97706" />;
    case 'followup_completed':
      return <CheckCircle2 size={14} color="#16a34a" />;
    case 'note_added':
      return <MessageSquare size={14} color="#7c3aed" />;
    default:
      return <Clock size={14} color="#64748b" />;
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
        Loading timeline events...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <Clock size={20} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        <p style={{ fontSize: '0.8125rem' }}>No activity records logged for this lead yet.</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
      {/* Vertical line indicator */}
      <div
        style={{
          position: 'absolute',
          left: '19px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: '#e2e8f0',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activities.map((act) => {
          const dateStr = act.created_at
            ? format(new Date(act.created_at), 'MMM dd, yyyy • h:mm a')
            : 'Unknown date';

          return (
            <div
              key={act.id}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              {/* Event Icon Bubble */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {getActivityIcon(act.activity_type)}
              </div>

              {/* Event Content */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.625rem 0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {act.actor?.full_name || 'System / Automated'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                    {dateStr}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-main)', lineHeight: 1.4, margin: 0 }}>
                  {act.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

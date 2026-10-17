import React, { useState } from 'react';
import { CalendarClock, AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

type FollowupTab = 'overdue' | 'upcoming' | 'completed';

export const FollowupsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FollowupTab>('upcoming');

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Follow-up Tasks
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Maintain continuous communication with students. Never miss an overdue enquiry.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          Schedule Follow-up
        </Button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.5rem'
        }}
      >
        <button
          onClick={() => setActiveTab('upcoming')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'upcoming' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'upcoming' ? '#ffffff' : 'var(--color-text-muted)',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Clock size={16} />
          Upcoming Tasks (0)
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'overdue' ? '#e11d48' : 'transparent',
            color: activeTab === 'overdue' ? '#ffffff' : 'var(--color-text-muted)',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <AlertCircle size={16} />
          Overdue Tasks (0)
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'completed' ? '#059669' : 'transparent',
            color: activeTab === 'completed' ? '#ffffff' : 'var(--color-text-muted)',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <CheckCircle2 size={16} />
          Completed (0)
        </button>
      </div>

      {/* Empty State */}
      <Card style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: activeTab === 'overdue' ? '#fff1f2' : '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTab === 'overdue' ? '#e11d48' : 'var(--color-accent)',
              marginBottom: '1rem'
            }}
          >
            <CalendarClock size={26} />
          </div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1.05rem' }}>
            {activeTab === 'overdue'
              ? 'Zero Overdue Follow-ups'
              : activeTab === 'upcoming'
              ? 'No Upcoming Follow-ups Scheduled'
              : 'No Completed History Yet'}
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '420px', marginTop: '0.35rem' }}>
            Follow-up scheduling with date/time pickers and automated overdue calculation will be integrated in Phase 7.
          </p>
        </div>
      </Card>
    </div>
  );
};

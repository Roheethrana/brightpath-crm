import React from 'react';
import { Users, UserPlus, Award, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface DashboardPageProps {
  onNavigateToLeads: () => void;
  onNavigateToFollowups: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToLeads,
  onNavigateToFollowups
}) => {
  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
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
          <Button variant="secondary" onClick={onNavigateToFollowups} icon={<Calendar size={16} />}>
            View Schedule
          </Button>
          <Button variant="primary" onClick={onNavigateToLeads} icon={<UserPlus size={16} />}>
            New Enquiry
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-stats">
        <StatCard
          label="Total Leads"
          value="0"
          subtitle="All accessible enquiries"
          icon={<Users size={22} color="#2563eb" />}
          iconBgColor="#eff6ff"
          trendText="Ready for database connection"
        />
        <StatCard
          label="New Enquiries"
          value="0"
          subtitle="Unassigned or uncontacted"
          icon={<UserPlus size={22} color="#0891b2" />}
          iconBgColor="#ecfeff"
          trendText="Phase 2/3 will sync live"
        />
        <StatCard
          label="Converted Admissions"
          value="0"
          subtitle="Successfully enrolled students"
          icon={<Award size={22} color="#059669" />}
          iconBgColor="#ecfdf5"
          trendText="Conversion Rate: 0.0%"
        />
        <StatCard
          label="Overdue Follow-ups"
          value="0"
          subtitle="Tasks pending past due date"
          icon={<AlertCircle size={22} color="#e11d48" />}
          iconBgColor="#fff1f2"
          isUrgent={false}
          trendText="Zero overdue"
        />
      </div>

      {/* Main Breakdown Section */}
      <div className="grid-two-col">
        <Card
          title="Pipeline Distribution by Status"
          subtitle="Enquiries progressing from New to Converted"
        >
          <div
            style={{
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-app)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--color-border)'
            }}
          >
            <TrendingUp size={36} style={{ color: 'var(--color-text-subtle)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>No Pipeline Data Yet</div>
            <div style={{ fontSize: '0.85rem', maxWidth: '360px', marginTop: '0.35rem' }}>
              Connect Supabase in Phase 2 to view live lead progression from New, Contacted, Qualified to Converted.
            </div>
          </div>
        </Card>

        <Card
          title="Upcoming Follow-ups"
          subtitle="Action items requiring counsellor attention"
          action={
            <Button variant="ghost" onClick={onNavigateToFollowups} style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
              View All
            </Button>
          }
        >
          <div
            style={{
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-app)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--color-border)'
            }}
          >
            <Calendar size={36} style={{ color: 'var(--color-text-subtle)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>No Scheduled Tasks</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Follow-ups scheduled with prospective students will appear here.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

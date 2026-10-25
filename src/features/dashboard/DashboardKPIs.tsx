import React from 'react';
import { Users, UserPlus, Award, AlertCircle } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

interface DashboardKPIsProps {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  overdueCount: number;
  isLiveSync: boolean;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  totalLeads,
  newLeads,
  convertedLeads,
  overdueCount,
  isLiveSync,
}) => {
  // Guarded against division by zero; strictly returns "0.0%" if totalLeads is 0
  const conversionRate =
    totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid-stats">
      <StatCard
        label="Total Enquiries"
        value={totalLeads.toString()}
        subtitle="All active student leads"
        icon={<Users size={22} color="#2563eb" />}
        iconBgColor="#eff6ff"
        trendText={isLiveSync ? 'Live Supabase Sync' : 'Local Seed Data Mode'}
      />

      <StatCard
        label="New Enquiries"
        value={newLeads.toString()}
        subtitle="Awaiting initial counsellor call"
        icon={<UserPlus size={22} color="#0891b2" />}
        iconBgColor="#ecfeff"
        trendText={`${totalLeads > 0 ? Math.round((newLeads / totalLeads) * 100) : 0}% of total pipeline`}
      />

      <StatCard
        label="Converted Admissions"
        value={convertedLeads.toString()}
        subtitle="Enrolled academy students"
        icon={<Award size={22} color="#059669" />}
        iconBgColor="#ecfdf5"
        trendText={`Conversion Rate: ${conversionRate}%`}
      />

      <StatCard
        label="Overdue Follow-ups"
        value={overdueCount.toString()}
        subtitle="Tasks pending past scheduled time"
        icon={<AlertCircle size={22} color="#e11d48" />}
        iconBgColor="#fff1f2"
        isUrgent={overdueCount > 0}
        trendText={overdueCount > 0 ? 'Requires immediate action' : 'Zero overdue tasks'}
      />
    </div>
  );
};

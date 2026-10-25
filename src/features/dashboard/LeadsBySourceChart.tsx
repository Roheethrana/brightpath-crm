import React from 'react';
import { Card } from '../../components/common/Card';
import { Lead, LeadSource } from '../../types/database.types';

interface LeadsBySourceChartProps {
  leads: Lead[];
}

const SOURCE_COLORS: Record<LeadSource, string> = {
  Website: '#2563eb',
  'Walk-in': '#059669',
  Call: '#d97706',
  Referral: '#7c3aed',
  'Social Media': '#db2777',
  Other: '#64748b',
};

export const LeadsBySourceChart: React.FC<LeadsBySourceChartProps> = ({ leads }) => {
  const total = leads.length;

  const sourceCounts: Record<LeadSource, number> = {
    Website: 0,
    'Walk-in': 0,
    Call: 0,
    Referral: 0,
    'Social Media': 0,
    Other: 0,
  };

  leads.forEach((l) => {
    if (sourceCounts[l.source] !== undefined) {
      sourceCounts[l.source]++;
    } else {
      sourceCounts.Other++;
    }
  });

  const sourcesList = (Object.keys(sourceCounts) as LeadSource[]).sort(
    (a, b) => sourceCounts[b] - sourceCounts[a]
  );

  return (
    <Card
      title="Intake Channel Performance"
      subtitle="Lead acquisition volume across marketing sources"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingTop: '0.5rem' }}>
        {sourcesList.map((src) => {
          const count = sourceCounts[src];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const color = SOURCE_COLORS[src] || '#64748b';

          return (
            <div key={src} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{src}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  <strong>{count}</strong> ({pct.toFixed(0)}%)
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: color,
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

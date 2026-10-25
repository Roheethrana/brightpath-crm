import React from 'react';
import { Card } from '../../components/common/Card';
import { Lead, LeadStatus } from '../../types/database.types';

interface LeadsByStatusChartProps {
  leads: Lead[];
}

const STATUS_CONFIG: { status: LeadStatus; label: string; color: string; bg: string }[] = [
  { status: 'New', label: 'New', color: '#2563eb', bg: '#eff6ff' },
  { status: 'Contacted', label: 'Contacted', color: '#0891b2', bg: '#ecfeff' },
  { status: 'Qualified', label: 'Qualified', color: '#d97706', bg: '#fffbeb' },
  { status: 'Converted', label: 'Converted', color: '#059669', bg: '#ecfdf5' },
  { status: 'Lost', label: 'Lost', color: '#e11d48', bg: '#fff1f2' },
];

export const LeadsByStatusChart: React.FC<LeadsByStatusChartProps> = ({ leads }) => {
  const total = leads.length;

  const counts: Record<LeadStatus, number> = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Converted: 0,
    Lost: 0,
  };

  leads.forEach((l) => {
    if (counts[l.status] !== undefined) {
      counts[l.status]++;
    }
  });

  return (
    <Card
      title="Pipeline Distribution by Status"
      subtitle="Progression of enquiries through admission stages"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
        {/* Multi-segmented visual bar */}
        <div
          style={{
            height: '14px',
            width: '100%',
            backgroundColor: '#f1f5f9',
            borderRadius: '9999px',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {total === 0 ? (
            <div style={{ width: '100%', backgroundColor: '#e2e8f0' }} />
          ) : (
            STATUS_CONFIG.map((cfg) => {
              const count = counts[cfg.status];
              const pct = (count / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={cfg.status}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: cfg.color,
                    transition: 'width 0.3s ease',
                  }}
                  title={`${cfg.label}: ${count} (${pct.toFixed(1)}%)`}
                />
              );
            })
          )}
        </div>

        {/* Detailed Status Breakdown Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {STATUS_CONFIG.map((cfg) => {
            const count = counts[cfg.status];
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={cfg.status}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: count > 0 ? cfg.bg : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: cfg.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{cfg.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{count}</span>
                  <span style={{ color: 'var(--color-text-subtle)', width: '42px', textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

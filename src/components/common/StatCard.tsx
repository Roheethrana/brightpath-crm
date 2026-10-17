import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trendText?: string;
  isUrgent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  iconBgColor = '#eff6ff',
  trendText,
  isUrgent
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: isUrgent ? '4px solid #e11d48' : undefined
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            {label}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: isUrgent ? '#e11d48' : 'var(--color-text-main)', marginTop: '0.25rem' }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: iconBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </div>
      </div>
      
      {(subtitle || trendText) && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {subtitle}
            </span>
          )}
          {trendText && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)' }}>
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

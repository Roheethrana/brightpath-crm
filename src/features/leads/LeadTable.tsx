import React from 'react';
import { Mail, Phone, Calendar, User, Eye } from 'lucide-react';
import { Lead } from '../../types/database.types';
import { Badge, BadgeVariant } from '../../components/common/Badge';
import { format } from 'date-fns';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onSelectLead?: (lead: Lead) => void;
}

const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'new';
    case 'contacted':
      return 'contacted';
    case 'qualified':
      return 'qualified';
    case 'converted':
      return 'converted';
    case 'lost':
      return 'lost';
    default:
      return 'neutral';
  }
};

const getSourceBadgeStyle = (source: string): { bg: string; color: string } => {
  switch (source) {
    case 'Website':
      return { bg: '#eff6ff', color: '#1d4ed8' };
    case 'Walk-in':
      return { bg: '#ecfdf5', color: '#047857' };
    case 'Call':
      return { bg: '#fef3c7', color: '#b45309' };
    case 'Referral':
      return { bg: '#f3e8ff', color: '#7e22ce' };
    case 'Social Media':
      return { bg: '#fce7f3', color: '#be185d' };
    default:
      return { bg: '#f1f5f9', color: '#475569' };
  }
};

export const LeadTable: React.FC<LeadTableProps> = ({ leads, isLoading, onSelectLead }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '1rem' }}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div className="skeleton-box" style={{ width: '140px', height: '20px' }} />
            <div className="skeleton-box" style={{ width: '120px', height: '16px' }} />
            <div className="skeleton-box" style={{ width: '180px', height: '16px' }} />
            <div className="skeleton-box" style={{ width: '70px', height: '20px', borderRadius: '9999px' }} />
            <div className="skeleton-box" style={{ width: '80px', height: '22px', borderRadius: '9999px' }} />
            <div className="skeleton-box" style={{ width: '100px', height: '16px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            margin: '0 auto 1rem',
          }}
        >
          <User size={24} />
        </div>
        <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1rem' }}>
          No Enquiries Matching Criteria
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '380px', margin: '0.35rem auto 0' }}>
          Try adjusting your search keywords, clearing status filters, or capture a new lead inquiry.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
            <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Student Name</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Contact</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Course Interest</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Source</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Assignee</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Created</th>
            <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const sourceStyle = getSourceBadgeStyle(lead.source);
            return (
              <tr
                key={lead.id}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background-color 0.15s ease',
                  cursor: onSelectLead ? 'pointer' : 'default',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => onSelectLead?.(lead)}
              >
                {/* Student Name */}
                <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  <div>{lead.full_name}</div>
                  {lead.notes && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 400,
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '0.15rem',
                      }}
                      title={lead.notes}
                    >
                      {lead.notes}
                    </div>
                  )}
                </td>

                {/* Contact */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-main)', fontSize: '0.8125rem' }}>
                      <Phone size={13} color="var(--color-text-subtle)" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        <Mail size={13} color="var(--color-text-subtle)" />
                        <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.email}>
                          {lead.email}
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Course Interest */}
                <td style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                  {lead.course_interest}
                </td>

                {/* Source Badge */}
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: sourceStyle.bg,
                      color: sourceStyle.color,
                    }}
                  >
                    {lead.source}
                  </span>
                </td>

                {/* Status Badge */}
                <td style={{ padding: '1rem' }}>
                  <Badge variant={getStatusBadgeVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                </td>

                {/* Assignee */}
                <td style={{ padding: '1rem', color: 'var(--color-text-main)' }}>
                  {lead.assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#475569',
                        }}
                      >
                        {lead.assignee.full_name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.8125rem' }}>{lead.assignee.full_name}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                      Unassigned
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} color="var(--color-text-subtle)" />
                    {lead.created_at ? format(new Date(lead.created_at), 'MMM dd, yyyy') : '—'}
                  </div>
                </td>

                {/* Action button */}
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-accent)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead?.(lead);
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

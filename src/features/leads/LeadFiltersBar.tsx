import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Profile, LeadStatus, LeadSource } from '../../types/database.types';

interface LeadFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (assigneeId: string) => void;
  assignees: Profile[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS: { label: string; value: LeadStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Qualified', value: 'Qualified' },
  { label: 'Converted', value: 'Converted' },
  { label: 'Lost', value: 'Lost' },
];

const SOURCE_OPTIONS: { label: string; value: LeadSource | 'all' }[] = [
  { label: 'All Sources', value: 'all' },
  { label: 'Website', value: 'Website' },
  { label: 'Walk-in', value: 'Walk-in' },
  { label: 'Call', value: 'Call' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Other', value: 'Other' },
];

export const LeadFiltersBar: React.FC<LeadFiltersBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedSource,
  onSourceChange,
  selectedAssignee,
  onAssigneeChange,
  assignees,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-subtle)',
            }}
          />
          <input
            type="text"
            placeholder="Search by student name, phone, course..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem 0.625rem 2.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-app)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={15} color="var(--color-text-muted)" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              color: 'var(--color-text-main)',
              cursor: 'pointer',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <select
          value={selectedSource}
          onChange={(e) => onSourceChange(e.target.value)}
          style={{
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            color: 'var(--color-text-main)',
            cursor: 'pointer',
          }}
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          value={selectedAssignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
          style={{
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            color: 'var(--color-text-main)',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Assignees</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name} ({a.role})
            </option>
          ))}
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset} icon={<RotateCcw size={14} />}>
            Reset
          </Button>
        )}
      </div>
    </Card>
  );
};

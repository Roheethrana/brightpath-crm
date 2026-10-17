import React, { useState } from 'react';
import { Search, Filter, Plus, Users, RotateCcw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const LeadsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedSource('all');
  };

  return (
    <div>
      {/* Page Header */}
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
            Student Enquiries
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Capture, qualify, and convert enquiries into admissions.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          Add New Lead
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-subtle)'
              }}
            />
            <input
              type="text"
              placeholder="Search by student name, phone, course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-app)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#ffffff',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Sources</option>
            <option value="Website">Website</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Call">Call</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || selectedStatus !== 'all' || selectedSource !== 'all') && (
            <Button variant="ghost" onClick={handleResetFilters} icon={<RotateCcw size={14} />}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Leads Table Container */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Student Name</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Contact Details</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Course Interest</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Source</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Assignee</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Next Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                        marginBottom: '1rem'
                      }}
                    >
                      <Users size={24} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1rem' }}>
                      No Leads Found
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '400px', marginTop: '0.35rem' }}>
                      Leads will be populated once Supabase credentials are configured in Phase 2 and database tables are linked in Phase 3.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

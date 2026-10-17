import React from 'react';
import { User, Shield, Database, Server } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { UserRoleInfo } from '../../types/navigation';

interface SettingsPageProps {
  currentUser: UserRoleInfo;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Profile & System Settings
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your account role, active session, and database connectivity.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* User Profile Card */}
        <Card title="Active User Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={30} />
            </div>
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {currentUser.email}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Badge variant={currentUser.role}>
                  {currentUser.role.toUpperCase()} ROLE
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Access Control & Security Rules */}
        <Card title="Role-Based Security Model">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Shield size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Strict Database Boundaries (PostgreSQL RLS)</strong>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  User roles are enforced server-side. Counsellors can only see assigned leads, while Managers and Administrators can review team performance.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Database size={20} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>No Client-Side Role Promotion</strong>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  Roles cannot be modified via client requests. Only project owners can bootstrap or adjust roles in the database.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Integration Status */}
        <Card title="Platform Connectivity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={16} color="var(--color-text-muted)" />
                <span>Supabase PostgreSQL & Auth</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                Pending Phase 2 Configuration
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

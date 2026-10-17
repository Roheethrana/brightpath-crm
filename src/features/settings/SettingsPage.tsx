import React from 'react';
import { Shield, Database, Server, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { UserRoleInfo } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database.types';
import { getSupabaseConfigStatus } from '../../lib/supabaseClient';

interface SettingsPageProps {
  currentUser: UserRoleInfo;
  onOpenAuthModal?: () => void;
  onOpenSetupModal?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenSetupModal
}) => {
  const { isAuthenticated, signOut, role, setDemoRole } = useAuth();
  const config = getSupabaseConfigStatus();

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Staff Profile & System Settings
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your account role, active session, and database connectivity.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* User Profile Card */}
        <Card
          title="Active Staff Profile"
          action={
            isAuthenticated ? (
              <Button variant="ghost" onClick={signOut} icon={<LogOut size={16} />} style={{ color: '#e11d48' }}>
                Sign Out
              </Button>
            ) : onOpenAuthModal ? (
              <Button variant="primary" onClick={onOpenAuthModal} icon={<LogIn size={16} />}>
                Sign In
              </Button>
            ) : null
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                {currentUser.email}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant={role}>
                  {role.toUpperCase()} ROLE
                </Badge>
                {isAuthenticated && (
                  <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> Authenticated Session
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Workshop Role Testing Switcher */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              Test Role Perspectives (Workshop Sandbox Mode):
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {(['counsellor', 'manager', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDemoRole(r)}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: role === r ? 'var(--color-accent-subtle)' : '#ffffff',
                    borderColor: role === r ? 'var(--color-accent)' : 'var(--color-border)',
                    color: role === r ? 'var(--color-accent)' : 'var(--color-text-main)',
                    fontWeight: role === r ? 700 : 500
                  }}
                >
                  Switch to {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Access Control & Security Rules */}
        <Card title="Role-Based Security Model">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Shield size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Server-Side Row Level Security (RLS)</strong>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  Database policies prevent unauthorized access. Counsellors query only their assigned/created leads; Managers and Admins access team metrics.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Database size={20} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Security Definer Protection</strong>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  Role resolution helper functions run in isolated database schemas to eliminate infinite recursive policy loops and client privilege escalations.
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
              <span
                onClick={onOpenSetupModal}
                style={{
                  fontSize: '0.8rem',
                  color: config.isConfigured ? '#047857' : '#b45309',
                  backgroundColor: config.isConfigured ? '#ecfdf5' : '#fef3c7',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {config.isConfigured ? 'Connected & Ready' : 'Setup Required'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

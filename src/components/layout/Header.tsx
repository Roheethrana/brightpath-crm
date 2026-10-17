import React from 'react';
import { Menu, Bell, LogIn, LogOut } from 'lucide-react';
import { NavTab, UserRoleInfo } from '../../types/navigation';
import { Badge } from '../common/Badge';
import { ConnectionBadge } from '../common/ConnectionBadge';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileNav: () => void;
  currentUser: UserRoleInfo;
  onOpenSetupModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileNav,
  currentUser,
  onOpenSetupModal,
  onOpenAuthModal
}) => {
  const { isAuthenticated, signOut, role } = useAuth();

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'leads':
        return 'Leads & Student Enquiries';
      case 'followups':
        return 'Follow-ups & Overdue Tasks';
      case 'settings':
        return 'System & Profile Settings';
      default:
        return 'BrightPath CRM';
    }
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileNav}
          className="btn btn-ghost"
          style={{ padding: '0.5rem', display: 'none' }}
          id="mobile-nav-toggle"
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {getTabTitle(currentTab)}
          </h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            BrightPath Academy &bull; Student Lifecycle
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Live Supabase Connection Beacon */}
        <ConnectionBadge onClick={onOpenSetupModal} />

        <button
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#2563eb',
              borderRadius: '50%'
            }}
          />
        </button>

        {/* User Account & Role Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant={role}>
            {role.toUpperCase()}
          </Badge>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {currentUser.name}
              </span>
              <button
                onClick={signOut}
                className="btn btn-ghost"
                style={{ padding: '0.4rem', color: '#e11d48' }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #mobile-nav-toggle {
            display: inline-flex !important;
          }
          header {
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </header>
  );
};

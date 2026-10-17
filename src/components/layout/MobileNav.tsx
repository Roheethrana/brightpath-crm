import React from 'react';
import { X, LayoutDashboard, Users, CalendarClock, Settings, GraduationCap } from 'lucide-react';
import { NavTab, UserRoleInfo } from '../../types/navigation';
import { Badge } from '../common/Badge';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserRoleInfo;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  currentUser
}) => {
  if (!isOpen) return null;

  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { tab: 'leads', label: 'Leads & Enquiries', icon: <Users size={20} /> },
    { tab: 'followups', label: 'Follow-ups', icon: <CalendarClock size={20} /> },
    { tab: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          maxWidth: '85%',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div>
          {/* Drawer Header */}
          <div
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GraduationCap size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                BrightPath CRM
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
              aria-label="Close Navigation"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleSelect(item.tab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                    color: isActive ? '#60a5fa' : '#94a3b8',
                    border: isActive ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'inline-flex', color: isActive ? '#60a5fa' : '#94a3b8' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
            {currentUser.name}
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <Badge variant={currentUser.role}>
              {currentUser.role.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

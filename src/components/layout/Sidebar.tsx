import React from 'react';
import { LayoutDashboard, Users, CalendarClock, Settings, GraduationCap } from 'lucide-react';
import { NavTab, UserRoleInfo } from '../../types/navigation';
import { Badge } from '../common/Badge';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserRoleInfo;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, currentUser }) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { tab: 'leads', label: 'Leads & Enquiries', icon: <Users size={20} /> },
    { tab: 'followups', label: 'Follow-ups', icon: <CalendarClock size={20} /> },
    { tab: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              BrightPath
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
              Admissions CRM
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
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
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
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

      {/* User Profile Footer */}
      <div
        style={{
          padding: '1.25rem 1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#f8fafc'
            }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </div>
            <div style={{ marginTop: '0.2rem' }}>
              <Badge variant={currentUser.role}>
                {currentUser.role.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

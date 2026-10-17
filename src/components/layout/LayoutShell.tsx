import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { NavTab, UserRoleInfo } from '../../types/navigation';

interface LayoutShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserRoleInfo;
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  children
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-wrapper">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          currentTab={currentTab}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          currentUser={currentUser}
        />
        <main className="page-body">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

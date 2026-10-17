import { useState } from 'react';
import { LayoutShell } from './components/layout/LayoutShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { LeadsPage } from './features/leads/LeadsPage';
import { FollowupsPage } from './features/followups/FollowupsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { SupabaseSetupModal } from './components/modals/SupabaseSetupModal';
import { NavTab, UserRoleInfo } from './types/navigation';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Initial demo user state for Phase 1/2 verification
  const currentUser: UserRoleInfo = {
    name: 'Demo Counsellor',
    role: 'counsellor',
    email: 'counsellor@brightpath.academy'
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateToLeads={() => setCurrentTab('leads')}
            onNavigateToFollowups={() => setCurrentTab('followups')}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
          />
        );
      case 'leads':
        return <LeadsPage />;
      case 'followups':
        return <FollowupsPage />;
      case 'settings':
        return <SettingsPage currentUser={currentUser} />;
      default:
        return (
          <DashboardPage
            onNavigateToLeads={() => setCurrentTab('leads')}
            onNavigateToFollowups={() => setCurrentTab('followups')}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
          />
        );
    }
  };

  return (
    <>
      <LayoutShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      >
        {renderContent()}
      </LayoutShell>

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </>
  );
}

export default App;

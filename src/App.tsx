import { useState } from 'react';
import { LayoutShell } from './components/layout/LayoutShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { LeadsPage } from './features/leads/LeadsPage';
import { FollowupsPage } from './features/followups/FollowupsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { NavTab, UserRoleInfo } from './types/navigation';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Initial demo user state for Phase 1 layout verification
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
          />
        );
      case 'leads':
        return <LeadsPage />;
      case 'followups':
        return <FollowupsPage />;
      case 'settings':
        return <SettingsPage currentUser={currentUser} />;
      default:
        return <DashboardPage onNavigateToLeads={() => setCurrentTab('leads')} onNavigateToFollowups={() => setCurrentTab('followups')} />;
    }
  };

  return (
    <LayoutShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      currentUser={currentUser}
    >
      {renderContent()}
    </LayoutShell>
  );
}

export default App;

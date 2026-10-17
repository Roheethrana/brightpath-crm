import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutShell } from './components/layout/LayoutShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { LeadsPage } from './features/leads/LeadsPage';
import { FollowupsPage } from './features/followups/FollowupsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { SupabaseSetupModal } from './components/modals/SupabaseSetupModal';
import { AuthModal } from './features/auth/AuthModal';
import { NavTab, UserRoleInfo } from './types/navigation';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { user, profile, role } = useAuth();

  // Dynamic user role info derived from active database profile or fallback
  const currentUser: UserRoleInfo = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Demo Counsellor',
    role: role,
    email: user?.email || 'counsellor@brightpath.academy'
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
        return (
          <SettingsPage
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
          />
        );
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
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      >
        {renderContent()}
      </LayoutShell>

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

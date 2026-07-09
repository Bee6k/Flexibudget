import { useState } from 'react';
import { Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED } from './Sidebar';
import TopBar from './TopBar';
import AppBackground from './AppBackground';
import GlobalFinanceDialogs from '../GlobalFinanceDialogs';
import OnboardingWizard from '../onboarding/OnboardingWizard';
import PageTransition from '../motion/PageTransition';
import AppLoader from '../ui/AppLoader';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loading, error, setError } = useFinance();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;

  const forcedOnboarding = location.pathname === '/onboarding';
  const needsOnboarding = Boolean(user && !user.onboarding_completed);
  const showOnboarding = needsOnboarding || forcedOnboarding;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      <AppBackground />
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <TopBar sidebarWidth={sidebarWidth} />
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 0 }}>
            {error}
          </Alert>
        )}
        <Box component="main" sx={{ flex: 1, p: { xs: 2.5, sm: 3, md: 4 }, overflow: 'auto', maxWidth: 1440 }}>
          {loading ? (
            <AppLoader />
          ) : (
            <PageTransition>
              <Suspense fallback={<AppLoader />}>
                <Outlet />
              </Suspense>
            </PageTransition>
          )}
        </Box>
      </Box>
      <GlobalFinanceDialogs />
      {showOnboarding && (
        <OnboardingWizard
          open
          forced={forcedOnboarding}
          onClose={() => {
            if (forcedOnboarding) navigate('/dashboard', { replace: true });
          }}
        />
      )}
    </Box>
  );
}

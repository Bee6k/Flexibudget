import { Suspense, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Alert, Link, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED } from './Sidebar';
import TopBar from './TopBar';
import AppBackground from './AppBackground';
import GlobalFinanceDialogs from '../GlobalFinanceDialogs';
import OnboardingWizard from '../onboarding/OnboardingWizard';
import PageTransition from '../motion/PageTransition';
import PageSkeleton from '../ui/PageSkeleton';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useSidebarState } from '../../hooks/useSidebarState';

export default function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, toggleSidebar] = useSidebarState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, error, setError } = useFinance();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarWidth = isMobile ? 0 : (sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED);

  const forcedOnboarding = location.pathname === '/onboarding';
  const needsOnboarding = Boolean(user && !user.onboarding_completed);
  const showOnboarding = needsOnboarding || forcedOnboarding;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      <Link
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -9999,
          zIndex: 9999,
          p: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1,
          '&:focus': { left: 8, top: 8 },
        }}
      >
        Skip to main content
      </Link>
      <AppBackground />
      <Sidebar
        open={sidebarOpen}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <TopBar
          sidebarWidth={sidebarWidth}
          onMenuClick={() => setMobileOpen(true)}
        />
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 0 }}>
            {error}
          </Alert>
        )}
        <Box
          id="main-content"
          component="main"
          sx={{ flex: 1, p: { xs: 2.5, sm: 3, md: 4 }, overflow: 'auto', maxWidth: 1440 }}
        >
          {loading ? (
            <PageSkeleton />
          ) : (
            <PageTransition>
              <Suspense fallback={<PageSkeleton />}>
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

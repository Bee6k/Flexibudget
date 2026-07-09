import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import AppBackground from './layout/AppBackground';
import AppLoader from './ui/AppLoader';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: 'background.default' }}>
        <AppBackground />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <AppLoader message="Checking your session…" />
        </Box>
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

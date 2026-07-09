import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

export default function PageTransition({ children }) {
  const location = useLocation();
  return (
    <Box key={location.pathname} className="animate-page-enter" sx={{ minHeight: '100%' }}>
      {children}
    </Box>
  );
}

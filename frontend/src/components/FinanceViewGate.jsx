import { Box, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import GlassCard from './ui/GlassCard';
import { useFinance } from '../context/FinanceContext';

export function FinanceUnavailable() {
  const { error, refresh } = useFinance();

  return (
    <Box sx={{ py: 6, maxWidth: 480, mx: 'auto' }} className="animate-scale-in">
      <GlassCard sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error || 'Financial data is unavailable. Check your connection and try again.'}
        </Alert>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={refresh} size="large">
          Try again
        </Button>
      </GlassCard>
    </Box>
  );
}

export default function FinanceViewGate({ children }) {
  const { view } = useFinance();
  if (!view) return <FinanceUnavailable />;
  return children;
}

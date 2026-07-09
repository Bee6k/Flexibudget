import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL } from '../../theme/surfaces';

export default function AppLoader({ message = 'Loading your finances…' }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 12,
        gap: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: isDark ? TEAL : NAVY,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark ? '0 8px 24px rgba(13,148,136,0.2)' : '0 8px 24px rgba(30,58,95,0.15)',
        }}
      >
        <AccountBalanceWalletIcon sx={{ color: '#FFFFFF', fontSize: 32 }} />
      </Box>
      <Stack alignItems="center" spacing={1.5}>
        <CircularProgress size={28} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}

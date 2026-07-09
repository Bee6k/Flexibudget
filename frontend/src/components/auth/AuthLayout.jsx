import { Box, Typography, Stack, Chip, Paper, alpha } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL, cardSurface } from '../../theme/surfaces';

const FEATURES = [
  'See how long your money will last',
  'Know which bills are covered first',
  'Get clear steps when finances tighten',
  'Built for irregular and freelance income',
];

export default function AuthLayout({ title, subtitle, children }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: isDark ? '#0B1120' : '#F8FAFC',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            top: '-10%',
            right: '-15%',
            background: isDark
              ? `radial-gradient(circle, ${alpha(TEAL, 0.08)} 0%, transparent 70%)`
              : `radial-gradient(circle, ${alpha(NAVY, 0.05)} 0%, transparent 70%)`,
            filter: 'blur(48px)',
            pointerEvents: 'none',
          }}
        />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: isDark ? TEAL : NAVY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark ? '0 4px 16px rgba(13,148,136,0.25)' : '0 4px 16px rgba(30,58,95,0.2)',
            }}
          >
            <AccountBalanceWalletIcon sx={{ color: '#FFFFFF', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing="-0.01em">FlexiBudget</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Smart money planning</Typography>
          </Box>
        </Stack>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{ mb: 2, maxWidth: 520, lineHeight: 1.15, letterSpacing: '-0.02em', color: isDark ? 'text.primary' : NAVY }}
          >
            Know exactly when your money runs out.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 460, fontWeight: 400, lineHeight: 1.6 }}>
            Plan with confidence — whether your income is steady, seasonal, or unpredictable.
          </Typography>
          <Stack spacing={1.25}>
            {FEATURES.map((f, i) => (
              <Chip
                key={f}
                label={f}
                variant="outlined"
                sx={{
                  justifyContent: 'flex-start',
                  height: 'auto',
                  py: 1.25,
                  px: 0.5,
                  borderRadius: 2.5,
                  borderColor: isDark ? alpha(TEAL, 0.25) : alpha(NAVY, 0.15),
                  bgcolor: isDark ? alpha(TEAL, 0.06) : alpha(NAVY, 0.03),
                  animation: `fadeSlideUp 0.4s ease ${0.08 + i * 0.06}s both`,
                  '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.45, fontWeight: 500 },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ position: 'relative', zIndex: 1 }}>
          Secure · NPR · Built for real-life budgets
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4 },
          position: 'relative',
        }}
      >
        <Paper
          elevation={0}
          className="animate-scale-in"
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            position: 'relative',
            zIndex: 1,
            ...cardSurface(isDark),
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, display: { md: 'none' } }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: isDark ? TEAL : NAVY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>FlexiBudget</Typography>
          </Stack>
          <Typography variant="h4" fontWeight={700} gutterBottom lineHeight={1.2} letterSpacing="-0.01em">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

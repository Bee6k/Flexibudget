import { Box, Typography, Stack, Paper, alpha } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL, TEAL_SOFT, CONTRAST, cardSurface } from '../../theme/surfaces';
import TextBehindHero from '../motion/TextBehindHero';
import BlurText from '../motion/BlurText';

/**
 * Split-screen auth — preferred circle / text-behind left panel,
 * with a soft curve that reaches into the form side.
 */
export default function AuthLayout({ title, subtitle, children }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const panelFill = isDark ? CONTRAST.darkElevated : '#F4F6F8';
  const pageBg = isDark ? CONTRAST.darkBg : '#EEF1F4';
  const curveStroke = isDark ? alpha(TEAL_SOFT, 0.4) : alpha(NAVY, 0.12);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: pageBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', md: 'flex-end' },
      }}
    >
      {/* Curved brand panel — arcs into the form side (top & bottom hug) */}
      <Box
        aria-hidden
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: { md: '66%', lg: '64%' },
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <defs>
            <filter id="authCurveShadow" x="-4%" y="-4%" width="115%" height="108%">
              <feDropShadow
                dx="8"
                dy="0"
                stdDeviation="16"
                floodColor={isDark ? '#000' : NAVY}
                floodOpacity={isDark ? 0.32 : 0.07}
              />
            </filter>
          </defs>
          <path
            d="M0,0 H700 C860,50 930,180 910,500 C890,820 820,950 680,1000 H0 Z"
            fill={panelFill}
            filter="url(#authCurveShadow)"
          />
          <path
            d="M700,0 C860,50 930,180 910,500 C890,820 820,950 680,1000"
            fill="none"
            stroke={curveStroke}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </Box>
      </Box>

      {/* Left content — same preferred composition, sits inside the curve */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: { md: '52%', lg: '50%' },
          zIndex: 2,
          px: { md: 7, lg: 10 },
          py: 8,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <TextBehindHero
          watermark="FLEXI"
          headline="Smart plans for a better"
          headlineEmphasis="financial future."
          support="Adaptive budgeting for irregular income — clear runway, priorities, and next steps."
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: isDark ? TEAL : NAVY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 8px 24px rgba(15,118,110,0.4)' : '0 8px 24px rgba(21,42,69,0.3)',
              }}
            >
              <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} letterSpacing="-0.02em">
              FlexiBudget
            </Typography>
          </Stack>
        </TextBehindHero>
      </Box>

      {/* Form — right side, lightly wrapped by the curve */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          width: { xs: '100%', md: '44%', lg: '42%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4, md: 3, lg: 5 },
          py: { xs: 4, md: 6 },
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={0}
          className="animate-scale-in"
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: 4,
            position: 'relative',
            zIndex: 1,
            ...cardSurface(isDark),
            boxShadow: isDark
              ? '0 20px 56px rgba(0,0,0,0.45)'
              : '0 20px 56px rgba(15,23,42,0.1)',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 3, display: { md: 'none' } }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: isDark ? TEAL : NAVY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>FlexiBudget</Typography>
          </Stack>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ lineHeight: 1.2, letterSpacing: '-0.02em', mb: 0.75 }}
          >
            <BlurText text={title} delay={35} />
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.6, fontSize: '0.9375rem' }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

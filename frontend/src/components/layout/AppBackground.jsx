import { Box, alpha } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL } from '../../theme/surfaces';

/** Subtle ambient background — calm, not distracting. */
export default function AppBackground() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        bgcolor: isDark ? '#0B1120' : '#F1F5F9',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 400, md: 600 },
          height: { xs: 400, md: 600 },
          borderRadius: '50%',
          top: '-15%',
          right: '-10%',
          background: isDark
            ? `radial-gradient(circle, ${alpha(TEAL, 0.06)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha(NAVY, 0.04)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 320, md: 480 },
          height: { xs: 320, md: 480 },
          borderRadius: '50%',
          bottom: '0%',
          left: '-8%',
          background: isDark
            ? `radial-gradient(circle, ${alpha(NAVY, 0.08)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha(TEAL, 0.05)} 0%, transparent 70%)`,
          filter: 'blur(64px)',
        }}
      />
    </Box>
  );
}

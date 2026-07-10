import { Box, alpha } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, NAVY_LIGHT, TEAL, TEAL_SOFT, CONTRAST } from '../../theme/surfaces';

/** Ambient background — light stays airy; dark gets soft navy/teal depth. */
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
        bgcolor: isDark ? CONTRAST.darkBg : CONTRAST.lightBg,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 420, md: 640 },
          height: { xs: 420, md: 640 },
          borderRadius: '50%',
          top: '-18%',
          right: '-12%',
          background: isDark
            ? `radial-gradient(circle, ${alpha(TEAL_SOFT, 0.11)} 0%, transparent 68%)`
            : `radial-gradient(circle, ${alpha(NAVY, 0.04)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 340, md: 520 },
          height: { xs: 340, md: 520 },
          borderRadius: '50%',
          bottom: '-8%',
          left: '-10%',
          background: isDark
            ? `radial-gradient(circle, ${alpha(NAVY_LIGHT, 0.45)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha(TEAL, 0.05)} 0%, transparent 70%)`,
          filter: 'blur(64px)',
        }}
      />
      {isDark && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(165deg, ${alpha(NAVY_LIGHT, 0.35)} 0%, transparent 42%, ${alpha(TEAL, 0.06)} 100%)`,
            opacity: 0.9,
          }}
        />
      )}
    </Box>
  );
}

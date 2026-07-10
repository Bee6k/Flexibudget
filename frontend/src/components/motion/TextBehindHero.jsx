import { Box, Typography, alpha } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';
import { NAVY, TEAL } from '../../theme/surfaces';

/**
 * Text-behind-objects — large watermark behind soft overlapping circles.
 * Original preferred composition (pre-curve / densify experiments).
 */
export default function TextBehindHero({
  watermark = 'FLEXI',
  headline,
  headlineEmphasis,
  support,
  children,
}) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { md: '70vh' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      <Typography
        aria-hidden
        sx={{
          position: 'absolute',
          left: { md: '-4%', lg: '0%' },
          top: '18%',
          fontSize: { md: '7.5rem', lg: '9.5rem' },
          fontWeight: 800,
          letterSpacing: '-0.06em',
          lineHeight: 0.85,
          color: isDark ? alpha('#F8FAFC', 0.045) : alpha(NAVY, 0.06),
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          whiteSpace: 'nowrap',
          animation: 'watermarkDrift 18s ease-in-out infinite',
        }}
      >
        {watermark}
      </Typography>
      <Typography
        aria-hidden
        sx={{
          position: 'absolute',
          right: { md: '-8%', lg: '-2%' },
          bottom: '8%',
          fontSize: { md: '5rem', lg: '6.5rem' },
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 0.9,
          color: isDark ? alpha(TEAL, 0.08) : alpha(TEAL, 0.1),
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          whiteSpace: 'nowrap',
          transform: 'rotate(-6deg)',
        }}
      >
        BUDGET
      </Typography>

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          top: '6%',
          left: '10%',
          bgcolor: isDark ? alpha(TEAL, 0.14) : alpha('#93C5FD', 0.4),
          zIndex: 1,
          animation: 'orbFloat 14s ease-in-out infinite',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: '50%',
          top: '20%',
          left: '42%',
          bgcolor: isDark ? alpha('#94A3B8', 0.12) : alpha('#CBD5E1', 0.65),
          zIndex: 1,
          animation: 'orbFloat 16s ease-in-out infinite reverse',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 148,
          height: 148,
          borderRadius: '50%',
          top: '16%',
          left: '52%',
          bgcolor: isDark ? TEAL : NAVY,
          zIndex: 2,
          boxShadow: isDark
            ? `0 20px 50px ${alpha(TEAL, 0.35)}`
            : `0 20px 50px ${alpha(NAVY, 0.25)}`,
          animation: 'orbPulse 6s ease-in-out infinite',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          bottom: '-22%',
          right: '-14%',
          bgcolor: isDark ? alpha(NAVY, 0.5) : alpha('#E2E8F0', 0.95),
          zIndex: 1,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          bottom: '14%',
          left: '4%',
          border: `2px solid ${isDark ? alpha('#fff', 0.1) : alpha(NAVY, 0.12)}`,
          zIndex: 1,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 3, maxWidth: 460 }}>
        {children}
        {(headline || headlineEmphasis) && (
          <Typography
            className="animate-blur-in"
            sx={{
              fontSize: { md: '2.35rem', lg: '2.75rem' },
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: isDark ? '#E8EDF5' : '#1E293B',
              maxWidth: 420,
              mt: children ? 5 : 0,
            }}
          >
            {headline}{' '}
            {headlineEmphasis && (
              <Box component="span" sx={{ fontWeight: 700, color: isDark ? '#F1F5F9' : NAVY }}>
                {headlineEmphasis}
              </Box>
            )}
          </Typography>
        )}
        {support && (
          <Typography
            className="animate-blur-in stagger-2"
            variant="body2"
            sx={{
              mt: 2.5,
              maxWidth: 360,
              lineHeight: 1.75,
              color: isDark ? alpha('#CBD5E1', 0.85) : '#475569',
              fontWeight: 400,
            }}
          >
            {support}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

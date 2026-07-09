import { Box } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';
import { cardSurface, hoverLift } from '../../theme/surfaces';

/**
 * Elevated card with optional accent stripe and subtle hover lift.
 */
export default function GlassCard({
  children,
  accent,
  hover = true,
  sx,
  className,
  onClick,
  ...rest
}) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box
      className={className}
      onClick={onClick}
      sx={{
        ...cardSurface(isDark),
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        ...(hover ? hoverLift(isDark ? 'rgba(13, 148, 136, 0.12)' : 'rgba(30, 58, 95, 0.08)') : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
        '&::before': accent
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: accent,
              borderRadius: '12px 12px 0 0',
            }
          : {},
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

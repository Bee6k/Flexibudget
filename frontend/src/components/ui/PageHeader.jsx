import { Box, Typography } from '@mui/material';
import { NAVY, TEAL } from '../../theme/surfaces';
import { useThemeMode } from '../../context/ThemeContext';

export default function PageHeader({ title, subtitle, action, badge }) {
  const { mode } = useThemeMode();
  const accent = mode === 'dark' ? TEAL : NAVY;

  return (
    <Box
      className="animate-stagger-item"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        mb: 4,
        gap: 2.5,
        position: 'relative',
        pb: 2.5,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 48,
          height: 3,
          borderRadius: 999,
          background: accent,
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {badge && (
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            {badge}
          </Typography>
        )}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: subtitle ? 1 : 0,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.65 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
}

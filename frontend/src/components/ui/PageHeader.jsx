import { Box, Typography } from '@mui/material';
import { NAVY, TEAL_SOFT } from '../../theme/surfaces';
import { useThemeMode } from '../../context/ThemeContext';
import Breadcrumbs from './Breadcrumbs';
import BlurText from '../motion/BlurText';

export default function PageHeader({ title, subtitle, action, badge, showBreadcrumbs = true }) {
  const { mode } = useThemeMode();
  const accent = mode === 'dark' ? TEAL_SOFT : NAVY;

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
        {showBreadcrumbs && <Breadcrumbs />}
        {badge && (
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            {badge}
          </Typography>
        )}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: subtitle ? 1 : 0,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          <BlurText text={title} delay={30} />
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

import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NAVY, TEAL_SOFT } from '../../theme/surfaces';
import { useThemeMode } from '../../context/ThemeContext';
import Breadcrumbs from './Breadcrumbs';
import BlurText from '../motion/BlurText';

export default function PageHeader({ title, subtitle, action, badge, showBreadcrumbs = true }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode } = useThemeMode();
  const accent = mode === 'dark' ? TEAL_SOFT : NAVY;

  return (
    <Box
      className="animate-stagger-item"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'flex-end' },
        mb: { xs: 2, sm: 3, md: 4 },
        gap: { xs: 1.5, sm: 2.5 },
        position: 'relative',
        pb: { xs: 1.5, sm: 2.5 },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: { xs: 32, sm: 48 },
          height: 3,
          borderRadius: 999,
          background: accent,
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {showBreadcrumbs && !isMobile && <Breadcrumbs />}
        {badge && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' }, mb: 0.75 }}
          >
            {badge}
          </Typography>
        )}
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'block',
              maxWidth: 640,
              lineHeight: 1.65,
              mt: { xs: 0.5, sm: 0 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' }, '& > *': { width: { xs: '100%', sm: 'auto' } } }}>
          {action}
        </Box>
      )}
    </Box>
  );
}

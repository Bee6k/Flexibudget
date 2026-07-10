import { Box, Typography, Chip, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GlassCard from './GlassCard';
import FadeContent from '../motion/FadeContent';

/**
 * Dashboard metric card — title, optional trend badge, large value, trend line, footer.
 * Matches modern fintech / shadcn-style KPI cards without changing data sources.
 */
export default function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  footer,
  className,
  delay = 0,
}) {
  const positive = trend == null ? null : Number(trend) >= 0;
  const trendText = trend == null
    ? null
    : `${positive ? '+' : ''}${Number(trend).toFixed(1)}%`;

  return (
    <FadeContent delay={Math.round(delay * 1000)} y={12} sx={{ height: '100%' }}>
    <GlassCard
      hover
      accent={undefined}
      className={className || ''}
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'auto', md: 168 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: { xs: 1, sm: 1.5 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, lineHeight: 1.3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {title}
        </Typography>
        {trendText && (
          <Chip
            size="small"
            icon={positive
              ? <TrendingUpIcon sx={{ fontSize: '14px !important' }} />
              : <TrendingDownIcon sx={{ fontSize: '14px !important' }} />}
            label={trendText}
            sx={{
              height: 24,
              fontWeight: 600,
              fontSize: '0.75rem',
              bgcolor: positive ? 'rgba(13,148,136,0.12)' : 'rgba(220,38,38,0.1)',
              color: positive ? 'success.main' : 'error.main',
              '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
            }}
          />
        )}
      </Stack>

      <Box sx={{ minWidth: 0, mb: 1 }}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.15rem', sm: 'clamp(1.5rem, 2.5vw, 1.875rem)' },
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              overflowWrap: 'anywhere',
            }}
          >
            {value}
          </Typography>
        ) : value}
      </Box>

      {trendLabel && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mb: 0.75, display: { xs: 'none', sm: 'flex' } }}
        >
          {positive != null && (
            positive
              ? <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
              : <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
          )}
          <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.4 }}>
            {trendLabel}
          </Typography>
        </Stack>
      )}

      {footer && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 'auto',
            pt: 0.5,
            lineHeight: 1.45,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {footer}
        </Typography>
      )}
    </GlassCard>
    </FadeContent>
  );
}

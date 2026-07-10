import { Box, Typography, Stack, LinearProgress, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GlassCard from './GlassCard';
import FadeContent from '../motion/FadeContent';
import { formatCurrency, formatPercent } from '../../utils/currency';

/**
 * Savings-target style card: category label, large target, thin progress bar, footer stats.
 */
export default function ProgressTargetCard({
  label,
  target,
  current,
  onDelete,
  deleteAriaLabel,
}) {
  const pct = target > 0 ? Math.min(100, (Number(current) / Number(target)) * 100) : 0;

  return (
    <FadeContent y={12} sx={{ height: '100%' }}>
    <GlassCard
      hover
      sx={{
        p: 2.75,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: '0.1em', fontWeight: 600 }}
        >
          {label}
        </Typography>
        {onDelete && (
          <IconButton size="small" aria-label={deleteAriaLabel || `Delete ${label}`} onClick={onDelete} sx={{ mt: -0.5, mr: -0.5 }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          mb: 2,
          overflowWrap: 'anywhere',
        }}
      >
        {formatCurrency(target)}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 999,
          mb: 1.5,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'),
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#F1F5F9' : '#0F172A'),
          },
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          {formatPercent(pct, 0)} achieved
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(current)}
        </Typography>
      </Stack>
    </GlassCard>
    </FadeContent>
  );
}

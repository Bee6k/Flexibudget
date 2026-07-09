import { Paper, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { formatCurrency } from '../utils/currency';
import { priorityLabel } from '../utils/copy';

const STATUS = {
  FUNDED: { color: '#10B981', chip: 'success' },
  PARTIAL: { color: '#F59E0B', chip: 'warning' },
  UNFUNDED: { color: '#EF4444', chip: 'error' },
};

export default function TierCard({ tier }) {
  const s = STATUS[tier.status] || STATUS.UNFUNDED;
  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        borderTop: `3px solid ${s.color}`,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>{priorityLabel(tier.tier)}</Typography>
        <Chip label={tier.status === 'FUNDED' ? 'Covered' : tier.status === 'PARTIAL' ? 'Partial' : 'Uncovered'} color={s.chip} size="small" />
      </Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>{tier.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {formatCurrency(tier.allocated)} <Typography component="span" variant="body2" color="text.disabled">/ {formatCurrency(tier.total_cost)}</Typography>
      </Typography>
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, tier.coverage_percentage || 0)}
          sx={{
            height: 8,
            borderRadius: 2,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 2 },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {Math.round(tier.coverage_percentage || 0)}% funded
        </Typography>
      </Box>
    </Paper>
  );
}

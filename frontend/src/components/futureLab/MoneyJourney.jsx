import { Box, Typography, Stack, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import { formatCurrency } from '../../utils/currency';

export default function MoneyJourney({ nodes }) {
  return (
    <GlassCard sx={{ p: 2.5, mb: 3, overflow: 'auto' }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Your money journey</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Follow the road — each stop shows money coming in or going out.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0, alignItems: { md: 'flex-start' }, pb: 1 }}>
        {nodes.map((node, i) => (
          <Box key={node.id} sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'flex-start', md: 'center' }, flex: { md: 1 }, minWidth: { md: 100 } }}>
            <JourneyNode node={node} />
            {i < nodes.length - 1 && (
              <Typography
                sx={{
                  color: 'text.disabled',
                  fontSize: '1.25rem',
                  px: { xs: 1, md: 0 },
                  py: { xs: 0, md: 0.5 },
                  transform: { md: 'rotate(90deg)' },
                }}
              >
                ↓
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </GlassCard>
  );
}

function JourneyNode({ node }) {
  const isNeg = node.delta != null && node.delta < 0;
  const isPos = node.delta != null && node.delta > 0;
  const border = node.tone === 'critical' ? '#EF4444' : node.tone === 'good' ? '#34D399' : node.tone === 'bad' ? '#F87171' : '#94A3B8';

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        border: `2px solid ${alpha(border, 0.5)}`,
        bgcolor: alpha(border, 0.08),
        textAlign: 'center',
        minWidth: 120,
        maxWidth: 160,
      }}
    >
      <Typography sx={{ fontSize: '1.5rem' }}>{node.emoji}</Typography>
      <Typography variant="caption" fontWeight={800} display="block">{node.label}</Typography>
      {node.delta != null && (
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ color: isPos ? 'success.main' : isNeg ? 'error.main' : 'text.secondary' }}
        >
          {isPos ? '+' : ''}{formatCurrency(node.delta)}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {node.detail}
      </Typography>
    </Box>
  );
}

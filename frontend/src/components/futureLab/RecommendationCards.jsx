import { Box, Typography, Stack, Button, Chip, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';

function Stars({ count }) {
  return (
    <Typography sx={{ color: '#FBBF24', fontSize: '0.8rem', letterSpacing: 2 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </Typography>
  );
}

export default function RecommendationCards({ recommendations, onApply }) {
  if (!recommendations?.length) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Recommended actions</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each suggestion shows how much safer your money could be.
      </Typography>
      <Stack spacing={1.5}>
        {recommendations.map((rec) => (
          <GlassCard key={rec.id} sx={{ p: 2, border: `1px solid ${alpha('#2DD4BF', 0.2)}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
              <Box>
                <Stars count={rec.stars} />
                <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>{rec.title}</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={rec.impact} sx={{ fontWeight: 700 }} />
                  <Chip size="small" label={`Risk ${rec.riskReduction}`} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                  <Chip size="small" label={rec.difficulty} variant="outlined" />
                </Stack>
              </Box>
              {rec.action && (
                <Button variant="contained" size="small" onClick={() => onApply(rec)} sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Try this fix
                </Button>
              )}
            </Stack>
          </GlassCard>
        ))}
      </Stack>
    </Box>
  );
}

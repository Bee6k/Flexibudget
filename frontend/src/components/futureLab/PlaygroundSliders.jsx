import { Box, Typography, Stack, Slider, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';

const SLIDERS = [
  { key: 'incomeBoost', label: 'Income change', min: -50, max: 50, unit: '%', helper: 'What if you earn more or less?' },
  { key: 'expenseBoost', label: 'Spending change', min: -40, max: 40, unit: '%', helper: 'Cut or increase all expenses' },
  { key: 'balanceAdjust', label: 'Extra savings', min: -100000, max: 200000, unit: 'NPR', step: 5000, helper: 'One-time boost or withdrawal' },
  { key: 'inflation', label: 'Price inflation', min: 0, max: 15, unit: '%', helper: 'Everything costs more' },
];

export default function PlaygroundSliders({ values, onChange }) {
  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Scenario playground</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Slide to experiment — updates instantly. Nothing saves until you choose to.
      </Typography>
      <Stack spacing={3}>
        {SLIDERS.map((s) => (
          <Box key={s.key}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="body2" fontWeight={700}>{s.label}</Typography>
              <Typography variant="body2" fontWeight={800} color="primary.main">
                {s.unit === 'NPR'
                  ? `NPR ${Number(values[s.key] || 0).toLocaleString()}`
                  : `${values[s.key] > 0 ? '+' : ''}${values[s.key]}%`}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">{s.helper}</Typography>
            <Slider
              value={values[s.key] ?? 0}
              onChange={(_, v) => onChange(s.key, v)}
              min={s.min}
              max={s.max}
              step={s.step || 1}
              sx={{
                mt: 0.5,
                '& .MuiSlider-thumb': { width: 18, height: 18 },
                '& .MuiSlider-track': { height: 6, borderRadius: 3 },
                '& .MuiSlider-rail': { height: 6, borderRadius: 3, opacity: 0.3 },
              }}
            />
          </Box>
        ))}
      </Stack>
    </GlassCard>
  );
}

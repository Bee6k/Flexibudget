import { useState } from 'react';
import { Box, Typography, Stack, Slider, Chip, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate } from '../../utils/dates';

export default function InteractiveTimeline({ milestones }) {
  const [index, setIndex] = useState(0);
  const current = milestones[index] || milestones[0];

  if (!current) return null;

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Watch the future</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Scrub through time — see your balance and what happens each week or month.
      </Typography>

      <Slider
        value={index}
        onChange={(_, v) => setIndex(v)}
        min={0}
        max={Math.max(0, milestones.length - 1)}
        step={1}
        marks={milestones.map((m, i) => ({ value: i, label: i === 0 || i === milestones.length - 1 ? m.label : '' }))}
        sx={{ mb: 3 }}
      />

      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha('#818CF8', 0.1), border: `1px solid ${alpha('#818CF8', 0.25)}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>{current.label}</Typography>
          {current.date && (
            <Typography variant="body2" color="text.secondary">{formatShortDate(current.date)}</Typography>
          )}
        </Stack>
        <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ mb: 2 }}>
          {current.balance != null ? formatCurrency(current.balance) : '—'}
        </Typography>

        {current.warning && (
          <Chip icon={<span>{current.warning.icon}</span>} label={current.warning.text} color="warning" sx={{ mb: 1.5, fontWeight: 700 }} />
        )}

        <Stack spacing={0.75}>
          {current.events?.map((ev, i) => (
            <Typography key={i} variant="body2" fontWeight={600}>
              {ev.icon} {ev.text}
            </Typography>
          ))}
          {current.incomeReceived > 0 && (
            <Typography variant="body2" fontWeight={600} color="success.main">
              💰 Income received: {formatCurrency(current.incomeReceived)}
            </Typography>
          )}
        </Stack>
      </Box>
    </GlassCard>
  );
}

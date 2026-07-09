import { Box, Typography, Stack, LinearProgress, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import { useThemeMode } from '../../context/ThemeContext';

export default function SurvivalMeter({ insight, stressScore, scenarioView }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const s = insight?.survival;
  const days = insight?.scenarioDays;
  const months = days == null ? '12+' : (days / 30).toFixed(1);
  const monthlyBurn = (scenarioView?.horizon?.daily_burn_rate || 0) * 30;
  const balance = Number(scenarioView?.current_balance) || 0;
  const emergencyScore = monthlyBurn > 0 ? Math.min(100, Math.round((balance / monthlyBurn) * 25)) : 50;

  return (
    <GlassCard sx={{ p: 3, mb: 3 }}>
      <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing="0.1em">
        Financial survival
      </Typography>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1, mb: 2 }}>
        <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>{s?.emoji}</Typography>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: s?.color, letterSpacing: '-0.03em' }}>
            {s?.label}
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            {insight?.plainSurvival}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        <MetricBar label="Days until money runs out" value={days == null ? 365 : days} max={365} unit={days == null ? '365+' : 'days'} color={s?.color} />
        <MetricBar label="Months you can afford" value={Math.min(12, Number(months))} max={12} unit={`${months} mo`} color="#38BDF8" />
        <MetricBar label="Emergency cushion" value={emergencyScore} max={100} unit={`${emergencyScore}/100`} color="#818CF8" />
        <MetricBar label="Financial stress" value={100 - stressScore} max={100} unit={stressScore > 70 ? 'Low' : stressScore > 40 ? 'Medium' : 'High'} color={stressScore > 70 ? '#34D399' : '#FBBF24'} invert />
      </Stack>
    </GlassCard>
  );
}

function MetricBar({ label, value, max, unit, color, invert }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = invert ? (pct < 35 ? '#34D399' : pct < 65 ? '#FBBF24' : '#F87171') : color;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" fontWeight={800} sx={{ color: barColor }}>{unit}</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={invert ? 100 - pct : pct}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: (t) => alpha(barColor, 0.15),
          '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

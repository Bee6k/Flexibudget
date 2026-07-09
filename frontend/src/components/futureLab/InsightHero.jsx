import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import { useThemeMode } from '../../context/ThemeContext';

export default function InsightHero({ insight, showCompare }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const riskColor = {
    LOW: '#059669',
    MEDIUM: '#D97706',
    HIGH: '#EA580C',
    CRITICAL: '#DC2626',
  }[insight?.risk] || '#64748B';

  return (
    <GlassCard
      accent={riskColor}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 3,
        bgcolor: isDark ? alpha(riskColor, 0.06) : alpha(riskColor, 0.04),
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={3}>
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em', lineHeight: 1.3, mb: 1.5 }}>
            {insight?.headline}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.0625rem', fontWeight: 600, mb: 2, lineHeight: 1.55 }}>
            {insight?.plainSurvival}
          </Typography>

          {showCompare && (
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Before:</strong> {insight?.plainLive}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>After this scenario:</strong> {insight?.plainSurvival}
              </Typography>
            </Stack>
          )}

          <Chip
            label={`Risk: ${insight?.risk}`}
            size="small"
            sx={{ fontWeight: 600, bgcolor: alpha(riskColor, 0.12), color: riskColor, mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>
            <strong>Main reason:</strong> {insight?.mainReason}
          </Typography>

          {insight?.fixes?.length > 0 && (
            <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: isDark ? alpha('#0D9488', 0.1) : alpha('#0D9488', 0.06), border: `1px solid ${alpha('#0D9488', 0.15)}` }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Suggested fix</Typography>
              {insight.fixes.map((f) => (
                <Typography key={f} variant="body2" sx={{ fontWeight: 500, lineHeight: 1.55 }}>→ {f}</Typography>
              ))}
            </Box>
          )}
        </Box>

        <Stack spacing={2.5} sx={{ minWidth: 140 }}>
          <ScoreRing label="Confidence" value={insight?.confidence} />
          <ScoreRing label="Health score" value={insight?.healthScore} />
        </Stack>
      </Stack>
    </GlassCard>
  );
}

function ScoreRing({ label, value }) {
  const color = value > 60 ? '#059669' : value > 35 ? '#D97706' : '#DC2626';
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          border: '3px solid',
          borderColor: alpha(color, 0.35),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 0.75,
        }}
      >
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
      </Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
    </Box>
  );
}

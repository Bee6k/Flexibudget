import { Box, Typography, Stack, alpha } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import { formatCurrency } from '../../utils/currency';

const TONE = {
  good: { border: '#34D399', bg: alpha('#34D399', 0.1) },
  bad: { border: '#F87171', bg: alpha('#F87171', 0.1) },
  neutral: { border: '#94A3B8', bg: alpha('#94A3B8', 0.08) },
  critical: { border: '#EF4444', bg: alpha('#EF4444', 0.15) },
};

export default function ScenarioStory({ steps }) {
  if (!steps?.length) {
    return (
      <GlassCard sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>Your scenario story</Typography>
        <Typography variant="body2" color="text.secondary">
          Add a life event above — your story will appear here step by step.
        </Typography>
      </GlassCard>
    );
  }

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Your scenario story</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Read what happens, in order — like a short story about your money.
      </Typography>
      <Stack spacing={0}>
        {steps.map((step, i) => {
          const tone = TONE[step.type === 'good' ? 'good' : step.type === 'bad' ? 'bad' : 'neutral'];
          return (
            <Box key={i} sx={{ display: 'flex', gap: 2 }}>
              <Stack alignItems="center" sx={{ width: 24 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: tone.border, mt: 0.75 }} />
                {i < steps.length - 1 && (
                  <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: alpha('#94A3B8', 0.25), my: 0.5 }} />
                )}
              </Stack>
              <Box
                sx={{
                  flex: 1,
                  pb: 2,
                  px: 2,
                  py: 1.25,
                  mb: 1,
                  borderRadius: 2,
                  borderLeft: `3px solid ${tone.border}`,
                  bgcolor: tone.bg,
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.55 }}>
                  {step.text}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </GlassCard>
  );
}

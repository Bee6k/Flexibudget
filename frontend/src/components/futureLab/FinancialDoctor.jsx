import { Box, Typography, Stack, Button, Chip, alpha } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GlassCard from '../ui/GlassCard';

const SEV = {
  high: { color: '#F87171', label: 'Urgent' },
  medium: { color: '#FBBF24', label: 'Watch' },
  low: { color: '#34D399', label: 'Minor' },
};

export default function FinancialDoctor({ issues }) {
  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <LocalHospitalIcon color="error" />
        <Typography variant="h6" fontWeight={800}>Financial doctor</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Problems we spotted in this scenario — and how to fix them.
      </Typography>
      <Stack spacing={1.5}>
        {issues.map((issue, i) => {
          const sev = SEV[issue.severity] || SEV.low;
          return (
            <Box
              key={i}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${alpha(sev.color, 0.35)}`,
                bgcolor: alpha(sev.color, 0.06),
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }}>
                <Chip size="small" label={sev.label} sx={{ bgcolor: alpha(sev.color, 0.2), color: sev.color, fontWeight: 800 }} />
                <Typography variant="subtitle2" fontWeight={800}>{issue.title}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{issue.explanation}</Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                Fix: {issue.fix}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </GlassCard>
  );
}

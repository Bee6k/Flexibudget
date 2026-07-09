import { Box, Typography, Stack, alpha } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import GlassCard from '../ui/GlassCard';

export default function FutureLabIntro({ onCurrent, onFresh, balance }) {
  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center', py: 3 }}>
      <Box className="future-lab-badge" sx={{ mb: 2, mx: 'auto', width: 'fit-content' }}>
        <ScienceOutlinedIcon sx={{ fontSize: 14 }} />
        Future Lab
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 1.5 }}>
        Welcome to Future Lab
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
        Play with tomorrow — safely. No spreadsheets. Just plain answers about whether you will be okay.
      </Typography>
      <Stack spacing={2.5}>
        <GlassCard
          onClick={onCurrent}
          hover
          sx={{
            p: 3,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <ContentCopyIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>Start from my real life</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
                Use your current balance, income, and bills — then ask &quot;what if?&quot;
              </Typography>
            </Box>
          </Stack>
        </GlassCard>
        <GlassCard
          onClick={onFresh}
          hover
          sx={{
            p: 3,
            cursor: 'pointer',
            textAlign: 'left',
            borderLeft: '4px solid',
            borderLeftColor: 'warning.main',
          }}
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => alpha(t.palette.warning.main, 0.1),
                color: 'warning.main',
                flexShrink: 0,
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>Imagine a new life</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
                Blank slate — build a completely different financial picture.
                {balance != null && ` (default start: NPR ${Number(balance).toLocaleString()})`}
              </Typography>
            </Box>
          </Stack>
        </GlassCard>
      </Stack>
    </Box>
  );
}

import { Box, Grid, Skeleton } from '@mui/material';
import GlassCard from './GlassCard';

/** Dashboard-style skeleton while finance data loads. */
export default function PageSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading page">
      <Skeleton variant="text" width={220} height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="55%" height={20} sx={{ mb: 4 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={4} key={i}>
            <GlassCard hover={false} sx={{ p: 3 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="70%" height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="90%" sx={{ mt: 1 }} />
            </GlassCard>
          </Grid>
        ))}
        <Grid item xs={12} lg={8}>
          <GlassCard hover={false} sx={{ p: 3, height: 320 }}>
            <Skeleton variant="rounded" height="100%" />
          </GlassCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <GlassCard hover={false} sx={{ p: 3, height: 320 }}>
            <Skeleton variant="rounded" height="100%" />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}

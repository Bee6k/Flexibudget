import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import GlassCard from '../components/ui/GlassCard';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <GlassCard hover={false} sx={{ p: { xs: 4, sm: 5 }, maxWidth: 480, textAlign: 'center', width: '100%' }}>
        <SearchOffOutlinedIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
          This route does not exist. Check the address or return to your financial overview.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" startIcon={<HomeOutlinedIcon />}>
          Back to overview
        </Button>
      </GlassCard>
    </Box>
  );
}

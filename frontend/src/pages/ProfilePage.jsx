import { Box, Grid, Typography, Avatar, Stack, Button } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { NAVY, TEAL } from '../theme/surfaces';
import { useThemeMode } from '../context/ThemeContext';
import { getInitials } from '../utils/initials';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { view } = useFinance();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const stats = [
    { label: 'Current balance', value: formatCurrency(view?.current_balance), highlight: true },
    { label: 'Active expenses', value: view?.expenses?.length ?? 0 },
    { label: 'Income sources', value: view?.incomes?.length ?? 0 },
    { label: 'Crisis state', value: view?.crisis?.state ?? '—' },
  ];

  return (
    <Box>
      <PageHeader badge="Account" title="Profile" subtitle="Your account and financial snapshot." />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <GlassCard className="animate-stagger-item stagger-1" sx={{ p: 3.5, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                mx: 'auto',
                mb: 2,
                bgcolor: isDark ? TEAL : NAVY,
                color: '#FFFFFF',
                fontSize: '1.75rem',
                fontWeight: 700,
              }}
            >
              {getInitials(user?.name) || user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography variant="h5" fontWeight={700} letterSpacing="-0.01em">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{user?.email}</Typography>
            <Stack spacing={1.25} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={() => navigate('/onboarding')} sx={{ borderRadius: 2.5 }}>
                Run setup wizard again
              </Button>
              <Button color="error" variant="outlined" onClick={logout} sx={{ borderRadius: 2.5 }}>
                Sign out
              </Button>
            </Stack>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={8}>
          <GlassCard className="animate-stagger-item stagger-2" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom letterSpacing="-0.01em">
              Financial summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {stats.map((stat) => (
                <Grid item xs={12} sm={6} key={stat.label}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'transform 0.22s ease',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <Typography variant="overline" color="text.secondary">{stat.label}</Typography>
                    <Typography
                      variant={stat.highlight ? 'h5' : 'body1'}
                      fontWeight={800}
                      sx={{ mt: 0.5, letterSpacing: stat.highlight ? '-0.02em' : undefined }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}

import { Box, Grid, Paper, Typography, Chip, Stack } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { AreaCashFlowChart } from '../components/charts/FinanceCharts';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { buildCashFlowSeries } from '../utils/financeMetrics';
import { crisisToColor } from '../theme/financialColors';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/dates';

export default function PredictionsPage() {
  const finance = useFinanceView();
  if (!finance) return <FinanceUnavailable />;
  const { view } = finance;

  const forecast = buildCashFlowSeries(view.horizon?.daily_snapshots, 90);
  const dailyBurn = view.horizon?.daily_burn_rate || 0;

  return (
    <Box>
      <PageHeader title="Forecasts" subtitle="See where your balance is heading and what to watch for." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Exhaustion date</Typography>
            <Typography variant="h5" fontWeight={700}>
              {view.horizon?.exhaustion_date ? formatShortDate(view.horizon.exhaustion_date) : 'Beyond 1 year'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Days remaining</Typography>
            <Typography variant="h5" fontWeight={700}>{view.horizon?.days_remaining ?? '365+'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Risk level</Typography>
            <Chip label={view.crisis?.state} sx={{ mt: 1, bgcolor: crisisToColor(view.crisis?.state), color: '#fff', fontWeight: 700 }} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>90-day balance forecast</Typography>
            <AreaCashFlowChart data={forecast} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Cash flow risks</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">Daily burn: {formatCurrency(dailyBurn)} — monthly equivalent {formatCurrency(dailyBurn * 30)}</Typography>
              <Typography variant="body2">{view.crisis?.message}</Typography>
              <Typography variant="body2" color="text.secondary">Projected income events: {view.horizon?.income_events_projected ?? 0}</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

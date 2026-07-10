import { Box, Grid, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import HealthScoreRing from '../components/ui/HealthScoreRing';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { computeEmergencyMonths, computeHealthScore, computeBurnRates } from '../utils/financeMetrics';
import { emergencyFundColor, crisisToColor } from '../theme/financialColors';
import { formatCurrency } from '../utils/currency';

export default function EmergencyFundPage() {
  const finance = useFinanceView();
  if (!finance) return <FinanceUnavailable />;
  const { view } = finance;

  const burn = computeBurnRates(view.horizon?.daily_burn_rate);
  const months = computeEmergencyMonths(view.current_balance, burn.monthly) ?? 0;
  const targetMonths = 6;
  const targetFund = burn.monthly * targetMonths;
  const coveragePct = Math.min(100, (months / targetMonths) * 100);
  const healthScore = computeHealthScore(view.crisis, view.allocation, view.current_balance);
  const riskLabel = months < 1 ? 'Critical' : months < 3 ? 'Moderate' : months < 6 ? 'Building' : 'Safe';

  return (
    <Box>
      <PageHeader
        title="Emergency Fund Center"
        subtitle="Estimate of how long your current balance covers monthly burn — not a separate savings account."
      />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary">Coverage</Typography>
            <Typography variant="h2" fontWeight={800} sx={{ color: emergencyFundColor(months) }}>
              {months.toFixed(1)}
            </Typography>
            <Typography variant="body1" color="text.secondary">months of expenses covered</Typography>
            <Chip label={riskLabel} sx={{ mt: 2, bgcolor: emergencyFundColor(months), color: '#fff', fontWeight: 700 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="overline" color="text.secondary">Current fund</Typography>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(view.current_balance)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="overline" color="text.secondary">6-month target</Typography>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(targetFund)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="body2" gutterBottom>Progress to 6-month safety net</Typography>
                <LinearProgress variant="determinate" value={coveragePct} sx={{ height: 12, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: emergencyFundColor(months) } }} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, display: 'flex', gap: 3, alignItems: 'center' }}>
            <HealthScoreRing score={healthScore} size={100} />
            <Box>
              <Typography variant="h6" fontWeight={700}>Financial health</Typography>
              <Typography variant="body2" color="text.secondary">{view.crisis?.message}</Typography>
              <Chip label={view.crisis?.state} size="small" sx={{ mt: 1, bgcolor: crisisToColor(view.crisis?.state), color: '#fff' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Runway insight</Typography>
            <Typography variant="body2" color="text.secondary">
              At {formatCurrency(burn.monthly)}/month burn, you need {formatCurrency(Math.max(0, targetFund - view.current_balance))} more to reach a 6-month emergency buffer.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

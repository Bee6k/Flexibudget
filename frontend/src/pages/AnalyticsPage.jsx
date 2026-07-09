import { Box, Grid, Paper, Typography } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { AreaCashFlowChart } from '../components/charts/FinanceCharts';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { buildCashFlowSeries, buildIncomeExpenseComparison } from '../utils/financeMetrics';
import { formatCurrency } from '../utils/currency';

export default function AnalyticsPage() {
  const finance = useFinanceView();
  if (!finance) return <FinanceUnavailable />;
  const { view } = finance;

  const cashFlow = buildCashFlowSeries(view.horizon?.daily_snapshots, 90);
  const { expenseTotal, incomeTotal } = buildIncomeExpenseComparison(view.expenses, view.incomes);

  return (
    <Box>
      <PageHeader title="Analytics" subtitle="Spending trends, income patterns, and tier performance." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Balance trend (90 days)</Typography>
            <AreaCashFlowChart data={cashFlow} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Monthly income</Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">{formatCurrency(incomeTotal)}</Typography>
          </Paper>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary">Monthly expenses</Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">{formatCurrency(expenseTotal)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Tier analysis</Typography>
            {(view.allocation?.tiers || []).map((t) => (
              <Box key={t.tier} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2">Tier {t.tier} · {t.name}</Typography>
                <Typography variant="body2" fontWeight={700}>{t.status} · {Math.round(t.coverage_percentage)}%</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

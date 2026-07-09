import { useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Chip, Stack } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { DonutAllocationChart } from '../components/charts/FinanceCharts';
import TierCard from '../components/TierCard';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { priorityLabel } from '../utils/copy';
import { formatCurrency } from '../utils/currency';
import { CHART_PALETTE } from '../theme/financialColors';

const BUDGET_CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Health', 'Insurance',
  'Education', 'Entertainment', 'Investment', 'Emergency', 'Savings', 'Other',
];

export default function BudgetPlannerPage() {
  const finance = useFinanceView();
  const [selectedCat, setSelectedCat] = useState(BUDGET_CATEGORIES[0]);

  const tierSummary = useMemo(() => {
    const expenses = finance?.view?.expenses || [];
    const byTier = { 1: 0, 2: 0, 3: 0, 4: 0 };
    expenses.forEach((e) => {
      const mult = e.frequency === 'weekly' ? 52 / 12 : e.frequency === 'yearly' ? 1 / 12 : 1;
      byTier[e.priority_tier] = (byTier[e.priority_tier] || 0) + Number(e.amount) * mult;
    });
    const total = Object.values(byTier).reduce((a, b) => a + b, 0) || 1;
    return [1, 2, 3, 4].map((tier) => ({
      tier,
      name: priorityLabel(tier),
      amount: byTier[tier],
      pct: (byTier[tier] / total) * 100,
    }));
  }, [finance?.view?.expenses]);

  if (!finance) return <FinanceUnavailable />;

  const { view } = finance;

  return (
    <Box>
      <PageHeader title="Budget planner" subtitle="See how your money is spread across essentials, stability, goals, and lifestyle." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            {(view.allocation?.tiers || []).map((t) => (
              <Grid item xs={12} sm={6} key={t.tier}>
                <TierCard tier={t} />
              </Grid>
            ))}
          </Grid>
          <Paper sx={{ p: 2.5, mt: 2.5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Category Workspace</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {BUDGET_CATEGORIES.map((c) => (
                <Chip key={c} label={c} clickable color={selectedCat === c ? 'primary' : 'default'} onClick={() => setSelectedCat(c)} />
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Map expenses to tiers in Expense Manager. Selected: <strong>{selectedCat}</strong>
            </Typography>
            {tierSummary.map((t, i) => (
              <Box key={t.tier} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{priorityLabel(t.tier)}</Typography>
                  <Typography variant="body2" fontWeight={700}>{formatCurrency(t.amount)} ({t.pct.toFixed(0)}%)</Typography>
                </Box>
                <LinearProgress variant="determinate" value={t.pct} sx={{ mt: 0.5, height: 8, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: CHART_PALETTE[i] } }} />
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, position: 'sticky', top: 16 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Allocation Mix</Typography>
            <DonutAllocationChart tiers={view.allocation?.tiers} />
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">Available surplus</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {formatCurrency(view.allocation?.surplus || 0)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

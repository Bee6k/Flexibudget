import { useState } from 'react';
import { Box, Grid, Typography, Stack, Button, LinearProgress, Alert, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import MetricCard from '../components/ui/MetricCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import FadeContent from '../components/motion/FadeContent';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { AnimatedCounter } from '../components/ui/KpiCard';
import {
  DonutAllocationChart, AreaCashFlowChart, IncomeExpenseBarChart, ChartEmptyAction,
} from '../components/charts/FinanceCharts';
import RecommendationPanel from '../components/RecommendationPanel';
import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { useToast } from '../context/ToastContext';
import { deleteExpense } from '../services/expenses';
import { deleteIncome } from '../services/incomes';
import {
  computeHealthScore, computeBurnRates, buildCashFlowSeries, buildIncomeExpenseComparison,
} from '../utils/financeMetrics';
import { chartPalette } from '../theme/financialColors';
import { priorityLabel, daysRemainingLabel } from '../utils/copy';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/dates';
import { useThemeMode } from '../context/ThemeContext';

const RANGE_OPTIONS = [
  { value: 7, label: '7d', shortLabel: '7d', fullLabel: 'Last 7 days' },
  { value: 30, label: '30d', shortLabel: '30d', fullLabel: 'Last 30 days' },
  { value: 90, label: '90d', shortLabel: '90d', fullLabel: 'Last 3 months' },
];

function runwayFooter(horizon) {
  const days = horizon?.days_remaining;
  if (days === null || days === undefined) return 'Runway covers more than a year';
  if (days === 0) return 'Runway may run out today';
  return `Runway: ${daysRemainingLabel(days)}`;
}

function netTrendPercent(net, incomeTotal) {
  if (!incomeTotal) return null;
  return (net / incomeTotal) * 100;
}

export default function ExecutiveDashboard() {
  const finance = useFinanceView();
  const { showToast } = useToast();
  const [range, setRange] = useState(30);
  const { mode } = useThemeMode();
  const palette = chartPalette(mode === 'dark');
  const [pendingRemove, setPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  if (!finance) return <FinanceUnavailable />;

  const { view, recommendations, setQuickAdd, refresh } = finance;

  const healthScore = computeHealthScore(view.crisis, view.allocation, view.current_balance);
  const burn = computeBurnRates(view.horizon?.daily_burn_rate);
  const cashFlow = buildCashFlowSeries(view.horizon?.daily_snapshots, range);
  const { expenseTotal, incomeTotal, net } = buildIncomeExpenseComparison(view.expenses, view.incomes);
  const netPct = netTrendPercent(net, incomeTotal);

  const upcomingBills = [...view.expenses]
    .filter((e) => e.due_date)
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
    .slice(0, 5);

  const upcomingIncome = [...view.incomes]
    .sort((a, b) => String(a.expected_date).localeCompare(String(b.expected_date)))
    .slice(0, 5);

  const showCrisisAlert = view.crisis?.state && view.crisis.state !== 'NORMAL';
  const balanceIsZero = Number(view.current_balance) <= 0;

  async function confirmDashboardRemove() {
    if (!pendingRemove) return;
    setRemoving(true);
    try {
      if (pendingRemove.kind === 'expense') {
        await deleteExpense(pendingRemove.item.expense_id);
        showToast(`Removed “${pendingRemove.item.name}”.`);
      } else {
        await deleteIncome(pendingRemove.item.income_id);
        showToast(`Removed “${pendingRemove.item.source_name}”.`);
      }
      await refresh();
      setPendingRemove(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not remove item.', 'error');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Box>
      <PageHeader
        badge="Dashboard"
        title="Financial Overview"
        subtitle="Your balance, spending pace, and what to focus on next — all in one place."
        action={(
          <Button
            component={RouterLink}
            to="/future-lab"
            variant="outlined"
            startIcon={<ScienceOutlinedIcon />}
          >
            Future Lab
          </Button>
        )}
      />

      {showCrisisAlert && (
        <Alert severity={view.crisis.state === 'CRISIS' ? 'error' : 'warning'} sx={{ mb: 2.5 }}>
          {view.crisis.message}
        </Alert>
      )}

      {balanceIsZero && (
        <Alert
          severity="info"
          sx={{ mb: 2.5 }}
          action={(
            <Button color="inherit" size="small" onClick={() => setQuickAdd('balance')}>
              Update balance
            </Button>
          )}
        >
          Your available balance is NPR 0. Set your current balance to unlock accurate runway and health scores.
        </Alert>
      )}

      {/* Metric row — 2×2 on phones, 4 across on desktop */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid item xs={6} sm={6} lg={3}>
          <MetricCard
            className="stagger-1"
            title="Available balance"
            value={<AnimatedCounter value={view.current_balance} variant="h3" />}
            trend={netPct}
            trendLabel={net >= 0 ? 'Net positive this month' : 'Spending exceeds income'}
            footer={runwayFooter(view.horizon)}
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <MetricCard
            className="stagger-2"
            delay={0.05}
            title="Monthly spending"
            value={formatCurrency(burn.monthly)}
            trendLabel={`${formatCurrency(burn.daily)} per day`}
            footer={`${formatCurrency(burn.weekly)} typical weekly burn`}
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <MetricCard
            className="stagger-3"
            delay={0.1}
            title="Financial health"
            value={String(healthScore)}
            trendLabel={
              healthScore >= 80
                ? 'Excellent resilience'
                : healthScore >= 60
                  ? 'Stable with room to optimize'
                  : 'Action recommended'
            }
            footer="Based on crisis state, coverage, and balance"
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <MetricCard
            className="stagger-4"
            delay={0.15}
            title="Monthly net"
            value={formatCurrency(net)}
            trend={netPct}
            trendLabel={net >= 0 ? 'Trending up this month' : 'Trending down this month'}
            footer={`Income ${formatCurrency(incomeTotal)} · Spending ${formatCurrency(expenseTotal)}`}
          />
        </Grid>
      </Grid>

      {/* Primary chart + income/spending bars */}
      <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
        <Grid item xs={12} lg={8}>
          <FadeContent delay={80} y={16} sx={{ height: '100%' }}>
          <GlassCard hover={false} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
                  Balance outlook
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected balance and income as bars for the selected period
                </Typography>
              </Box>
              <SegmentedControl
                options={RANGE_OPTIONS}
                value={range}
                onChange={setRange}
                ariaLabel="Balance outlook range"
              />
            </Box>
            <AreaCashFlowChart
              data={cashFlow}
              emptyAction={(
                <Stack direction="row" spacing={1}>
                  <ChartEmptyAction to="/profile" label="Update balance" />
                  <ChartEmptyAction to="/income" label="Add income" />
                </Stack>
              )}
            />
          </GlassCard>
          </FadeContent>
        </Grid>

        <Grid item xs={12} lg={4}>
          <FadeContent delay={140} y={16} sx={{ height: '100%' }}>
          <GlassCard
            hover={false}
            sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em' }} gutterBottom>
              Income vs spending
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly comparison
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <IncomeExpenseBarChart expenseTotal={expenseTotal} incomeTotal={incomeTotal} />
            </Box>
            <Box sx={{ mt: 'auto', pt: 2, p: 1.75, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">Left after bills & spending</Typography>
                <Typography variant="subtitle2" fontWeight={700} color={net >= 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(net)}
                </Typography>
              </Stack>
            </Box>
          </GlassCard>
          </FadeContent>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FadeContent delay={180} y={14} sx={{ height: '100%' }}>
          <GlassCard hover={false} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <TrendingDownIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Upcoming bills</Typography>
              </Stack>
              <Button size="small" onClick={() => setQuickAdd('manage-expenses')} sx={{ textTransform: 'none' }}>
                Manage
              </Button>
            </Stack>
            {upcomingBills.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Add due dates to expenses in Expense Manager to see upcoming bills here.
              </Typography>
            ) : (
              upcomingBills.map((e) => (
                <Box
                  key={e.expense_id}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: 1, borderColor: 'divider', gap: 1 }}
                >
                  <Box sx={{ minWidth: 0, pr: 1, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{e.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatShortDate(e.due_date)} · {priorityLabel(e.priority_tier)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                    {formatCurrency(e.amount)}
                  </Typography>
                  <Tooltip title="Remove expense">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remove ${e.name}`}
                      onClick={() => setPendingRemove({ kind: 'expense', item: e })}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))
            )}
          </GlassCard>
          </FadeContent>
        </Grid>

        <Grid item xs={12} md={6}>
          <FadeContent delay={220} y={14} sx={{ height: '100%' }}>
          <GlassCard hover={false} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <TrendingUpIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Expected income</Typography>
              </Stack>
              <Button size="small" onClick={() => setQuickAdd('manage-income')} sx={{ textTransform: 'none' }}>
                Manage
              </Button>
            </Stack>
            {upcomingIncome.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No income scheduled yet. Add salary or freelance payments in Income Manager.
              </Typography>
            ) : (
              upcomingIncome.map((i) => (
                <Box
                  key={i.income_id}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: 1, borderColor: 'divider', gap: 1 }}
                >
                  <Box sx={{ minWidth: 0, pr: 1, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{i.source_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatShortDate(i.expected_date)}{i.is_recurring ? ' · Recurring' : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                    {formatCurrency(i.amount)}
                  </Typography>
                  <Tooltip title="Remove income">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remove ${i.source_name}`}
                      onClick={() => setPendingRemove({ kind: 'income', item: i })}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))
            )}
          </GlassCard>
          </FadeContent>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <FadeContent delay={260} y={14} sx={{ height: '100%' }}>
          <GlassCard hover={false} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Where your money goes</Typography>
            <DonutAllocationChart tiers={view.allocation?.tiers} legend={false} />
            <Stack spacing={1.5} mt={2}>
              {(view.allocation?.tiers || []).map((t, i) => (
                <Box key={t.tier}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">{priorityLabel(t.tier)}</Typography>
                    <Typography variant="body2" fontWeight={700}>{Math.round(t.coverage_percentage)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, t.coverage_percentage || 0)}
                    sx={{
                      height: 6,
                      borderRadius: 999,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        bgcolor: palette[i % palette.length],
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </GlassCard>
          </FadeContent>
        </Grid>

        <Grid item xs={12} md={7}>
          <FadeContent delay={300} y={14} sx={{ height: '100%' }}>
          <GlassCard hover={false} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.25} mb={1}>
              <AutoAwesomeIcon color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Suggested next steps</Typography>
            </Stack>
            <RecommendationPanel
              embedded
              recommendations={recommendations}
              onAccept={(rec) => setPendingRemove({
                kind: 'expense',
                item: { expense_id: rec.expense_id, name: rec.expense_name },
              })}
            />
            {(!recommendations || recommendations.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                You are in good shape. We will suggest changes if your balance outlook tightens.
              </Typography>
            )}
          </GlassCard>
          </FadeContent>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title={pendingRemove?.kind === 'expense' ? 'Remove expense?' : 'Remove income?'}
        message={
          pendingRemove?.kind === 'expense'
            ? `“${pendingRemove?.item?.name}” will be removed from your budget.`
            : `“${pendingRemove?.item?.source_name}” will be removed from your schedule.`
        }
        confirmLabel="Remove"
        loading={removing}
        onClose={() => !removing && setPendingRemove(null)}
        onConfirm={confirmDashboardRemove}
      />
    </Box>
  );
}

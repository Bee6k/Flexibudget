import { Box, Grid, Typography, Stack, Button, LinearProgress, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';

import { KpiCard, AnimatedCounter, MetricLabel } from '../components/ui/KpiCard';

import HealthScoreRing from '../components/ui/HealthScoreRing';

import {

  DonutAllocationChart, AreaCashFlowChart, IncomeExpenseBarChart, ChartEmptyAction,

} from '../components/charts/FinanceCharts';

import RecommendationPanel from '../components/RecommendationPanel';

import { FinanceUnavailable } from '../components/FinanceViewGate';
import { useFinanceView } from '../hooks/useFinanceReady';
import { deleteExpense } from '../services/expenses';

import {

  computeHealthScore, computeBurnRates, buildCashFlowSeries, buildIncomeExpenseComparison,

} from '../utils/financeMetrics';

import { balanceStatusColor, CHART_PALETTE } from '../theme/financialColors';

import { priorityLabel, daysRemainingLabel } from '../utils/copy';

import { formatCurrency } from '../utils/currency';

import { formatShortDate } from '../utils/dates';

import { useState } from 'react';



function balanceSubtitle(horizon, net) {

  const days = horizon?.days_remaining;

  let runway;

  if (days === null || days === undefined) runway = 'Runway: more than a year';

  else if (days === 0) runway = 'Runway: may run out today';

  else runway = `Runway: ${daysRemainingLabel(days)}`;

  return `${runway} · Monthly net ${formatCurrency(net)}`;

}



export default function ExecutiveDashboard() {

  const finance = useFinanceView();
  const [range, setRange] = useState(30);

  if (!finance) return <FinanceUnavailable />;

  const { view, recommendations, setQuickAdd, refresh } = finance;



  const healthScore = computeHealthScore(view.crisis, view.allocation, view.current_balance);

  const burn = computeBurnRates(view.horizon?.daily_burn_rate);

  const cashFlow = buildCashFlowSeries(view.horizon?.daily_snapshots, range);

  const { expenseTotal, incomeTotal, net } = buildIncomeExpenseComparison(view.expenses, view.incomes);

  const upcomingBills = [...view.expenses]

    .filter((e) => e.due_date)

    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))

    .slice(0, 5);

  const upcomingIncome = [...view.incomes]

    .sort((a, b) => String(a.expected_date).localeCompare(String(b.expected_date)))

    .slice(0, 5);

  const showCrisisAlert = view.crisis?.state && view.crisis.state !== 'NORMAL';

  const balanceIsZero = Number(view.current_balance) <= 0;

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
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
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

          action={

            <Button color="inherit" size="small" onClick={() => setQuickAdd('balance')}>

              Update balance

            </Button>

          }

        >

          Your available balance is NPR 0. Set your current balance to unlock accurate runway and health scores.

        </Alert>

      )}



      <Grid container spacing={3} sx={{ mb: 3, alignItems: 'stretch' }}>

        <Grid item xs={12} md={4} lg={3}>
          <GlassCard
            className="animate-stagger-item stagger-1"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2,
            }}
          >

            <HealthScoreRing score={healthScore} size={136} />

            <Box sx={{ flex: 1, minWidth: 0 }}>

              <MetricLabel>Financial health</MetricLabel>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>

                {healthScore >= 80

                  ? 'Excellent resilience'

                  : healthScore >= 60

                    ? 'Stable with room to optimize'

                    : 'Action recommended — review spending and income'}

              </Typography>

            </Box>

          </GlassCard>
        </Grid>

        <Grid item xs={12} md={4} lg={5}>
          <KpiCard
            className="stagger-2"
            delay={0.08}

            title="Available balance"

            accent={balanceStatusColor(view.current_balance)}

            value={(

              <AnimatedCounter

                value={view.current_balance}

                variant="h3"

                color={balanceStatusColor(view.current_balance)}

              />

            )}

            subtitle={balanceSubtitle(view.horizon, net)}

          />

        </Grid>

        <Grid item xs={12} md={4} lg={4}>
          <KpiCard
            className="stagger-3"
            delay={0.12}

            title="Typical monthly spending"

            accent="#F59E0B"

            value={(

              <Typography sx={{ fontWeight: 700, fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', overflowWrap: 'anywhere' }}>

                {formatCurrency(burn.monthly)}

              </Typography>

            )}

            subtitle={`${formatCurrency(burn.daily)}/day · ${formatCurrency(burn.weekly)}/week`}

          />

        </Grid>

      </Grid>



      <Grid container spacing={3} sx={{ mb: 3, alignItems: 'stretch' }}>

        <Grid item xs={12} lg={8}>
          <GlassCard className="animate-stagger-item stagger-4" sx={{ p: 3, height: '100%' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>

              <Typography variant="h6" fontWeight={700}>Balance outlook</Typography>

              <Stack direction="row" spacing={0.5}>

                {[7, 30, 90].map((d) => (

                  <Button key={d} size="small" variant={range === d ? 'contained' : 'outlined'} onClick={() => setRange(d)}>

                    {d}d

                  </Button>

                ))}

              </Stack>

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
        </Grid>

        <Grid item xs={12} lg={4}>
          <GlassCard className="animate-stagger-item stagger-5" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>

            <Typography variant="h6" fontWeight={700} gutterBottom>Income vs spending</Typography>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

              <IncomeExpenseBarChart expenseTotal={expenseTotal} incomeTotal={incomeTotal} />

            </Box>

            <Box sx={{ mt: 'auto', pt: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>

              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>

                <Typography variant="body2" color="text.secondary">Left after bills & spending</Typography>

                <Typography variant="subtitle2" fontWeight={700} color={net >= 0 ? 'success.main' : 'error.main'}>

                  {formatCurrency(net)}

                </Typography>

              </Stack>

            </Box>

          </GlassCard>
        </Grid>

      </Grid>



      <Grid container spacing={3} sx={{ mb: 3 }}>

        <Grid item xs={12} md={6}>

          <GlassCard className="animate-stagger-item" sx={{ p: 3, height: '100%' }}>

            <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>

              <TrendingDownIcon color="error" sx={{ fontSize: 20 }} />

              <Typography variant="h6" fontWeight={700}>Upcoming bills</Typography>

            </Stack>

            {upcomingBills.length === 0 ? (

              <Typography variant="body2" color="text.secondary">

                Add due dates to expenses in Expense Manager to see upcoming bills here.

              </Typography>

            ) : (

              upcomingBills.map((e) => (

                <Box key={e.expense_id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25, borderBottom: 1, borderColor: 'divider' }}>

                  <Box sx={{ minWidth: 0, pr: 1 }}>

                    <Typography variant="body2" fontWeight={600} noWrap>{e.name}</Typography>

                    <Typography variant="caption" color="text.secondary">{formatShortDate(e.due_date)} · {priorityLabel(e.priority_tier)}</Typography>

                  </Box>

                  <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>{formatCurrency(e.amount)}</Typography>

                </Box>

              ))

            )}

          </GlassCard>

        </Grid>

        <Grid item xs={12} md={6}>

          <GlassCard className="animate-stagger-item" sx={{ p: 3, height: '100%' }}>

            <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>

              <TrendingUpIcon color="success" sx={{ fontSize: 20 }} />

              <Typography variant="h6" fontWeight={700}>Expected income</Typography>

            </Stack>

            {upcomingIncome.length === 0 ? (

              <Typography variant="body2" color="text.secondary">

                No income scheduled yet. Add salary or freelance payments in Income Manager.

              </Typography>

            ) : (

              upcomingIncome.map((i) => (

                <Box key={i.income_id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25, borderBottom: 1, borderColor: 'divider' }}>

                  <Box sx={{ minWidth: 0, pr: 1 }}>

                    <Typography variant="body2" fontWeight={600} noWrap>{i.source_name}</Typography>

                    <Typography variant="caption" color="text.secondary">

                      {formatShortDate(i.expected_date)}{i.is_recurring ? ' · Recurring' : ''}

                    </Typography>

                  </Box>

                  <Typography variant="body2" fontWeight={700} color="success.main" sx={{ flexShrink: 0 }}>

                    {formatCurrency(i.amount)}

                  </Typography>

                </Box>

              ))

            )}

          </GlassCard>

        </Grid>

      </Grid>



      <Grid container spacing={3}>

        <Grid item xs={12} md={5}>

          <GlassCard className="animate-stagger-item" sx={{ p: 3, height: '100%' }}>

            <Typography variant="h6" fontWeight={700} gutterBottom>Where your money goes</Typography>

            <DonutAllocationChart tiers={view.allocation?.tiers} legend={false} />

            <Stack spacing={1.25} mt={2}>

              {(view.allocation?.tiers || []).map((t, i) => (

                <Box key={t.tier}>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>

                    <Typography variant="body2">{priorityLabel(t.tier)}</Typography>

                    <Typography variant="body2" fontWeight={700}>{Math.round(t.coverage_percentage)}%</Typography>

                  </Box>

                  <LinearProgress

                    variant="determinate"

                    value={Math.min(100, t.coverage_percentage || 0)}

                    sx={{

                      height: 6,

                      borderRadius: 1,

                      bgcolor: 'action.hover',

                      '& .MuiLinearProgress-bar': { bgcolor: CHART_PALETTE[i % CHART_PALETTE.length] },

                    }}

                  />

                </Box>

              ))}

            </Stack>

          </GlassCard>

        </Grid>

        <Grid item xs={12} md={7}>

          <GlassCard className="animate-stagger-item" sx={{ p: 3, height: '100%' }}>

            <Stack direction="row" alignItems="center" spacing={1.25} mb={1}>

              <AutoAwesomeIcon color="primary" sx={{ fontSize: 20 }} />

              <Typography variant="h6" fontWeight={700}>Suggested next steps</Typography>

            </Stack>

            <RecommendationPanel

              embedded

              recommendations={recommendations}

              onAccept={async (rec) => { await deleteExpense(rec.expense_id); await refresh(); }}

            />

            {(!recommendations || recommendations.length === 0) && (

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>

                You are in good shape. We will suggest changes if your balance outlook tightens.

              </Typography>

            )}

          </GlassCard>

        </Grid>

      </Grid>

    </Box>

  );

}


import { calculateAllocation, simulateHorizon, evaluateCrisisState } from './algorithms';
import { priorityLabel } from './copy';

export function flattenExpenses(expensesByTier) {
  if (!expensesByTier) return [];
  return [1, 2, 3, 4].flatMap((tier) => expensesByTier[tier] || []);
}

export function computeHealthScore(crisis, allocation, balance) {
  let score = 35;
  if (crisis?.state === 'NORMAL') score += 35;
  else if (crisis?.state === 'CAUTION') score += 15;
  else score -= 5;

  const tiers = allocation?.tiers || [];
  const avgCoverage = tiers.length
    ? tiers.reduce((sum, t) => sum + (t.coverage_percentage || 0), 0) / tiers.length
    : 0;
  score += (avgCoverage / 100) * 25;

  if (Number(balance) > 50000) score += 5;
  if (Number(balance) <= 0) score -= 15;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function computeBurnRates(dailyBurn) {
  const daily = Number(dailyBurn) || 0;
  return {
    daily,
    weekly: daily * 7,
    monthly: daily * 30,
  };
}

export function computeEmergencyMonths(balance, monthlyBurn) {
  if (!monthlyBurn || monthlyBurn <= 0) return null;
  return Number(((Number(balance) || 0) / monthlyBurn).toFixed(1));
}

export function buildCashFlowSeries(snapshots, rangeDays = 30) {
  return (snapshots || []).slice(0, rangeDays).map((s) => ({
    date: s.date,
    balance: Math.round(s.balance),
    income: s.income_received || 0,
  }));
}

/** End-of-month balances for the next N months (30-day buckets). */
export function buildMonthlyOutlook(snapshots, months = 3) {
  const daysPerMonth = 30;
  return Array.from({ length: months }, (_, i) => {
    const dayIndex = (i + 1) * daysPerMonth - 1;
    const snap = snapshots?.[dayIndex];
    return {
      month: i + 1,
      label: `Month ${i + 1}`,
      balance: snap ? Math.round(snap.balance) : null,
      date: snap?.date || null,
    };
  });
}

export function buildIncomeExpenseComparison(expenses, incomes) {
  const expenseTotal = expenses.reduce((sum, e) => {
    const mult = e.frequency === 'weekly' ? 52 / 12 : e.frequency === 'yearly' ? 1 / 12 : 1;
    return sum + Number(e.amount || 0) * mult;
  }, 0);
  const incomeTotal = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  return { expenseTotal, incomeTotal, net: incomeTotal - expenseTotal };
}

export function expensesToTransactions(expenses) {
  return (expenses || []).map((e) => ({
    id: `exp-${e.expense_id}`,
    type: 'expense',
    name: e.name,
    amount: -Number(e.amount),
    date: e.due_date || new Date().toISOString().slice(0, 10),
    category: priorityLabel(e.priority_tier),
    tier: e.priority_tier,
    frequency: e.frequency,
    raw: e,
  }));
}

export function incomesToTransactions(incomes) {
  return (incomes || []).map((i) => ({
    id: `inc-${i.income_id}`,
    type: 'income',
    name: i.source_name,
    amount: Number(i.amount),
    date: i.expected_date,
    category: i.is_recurring ? 'Recurring income' : 'One-time income',
    frequency: i.is_recurring ? 'recurring' : 'one-time',
    raw: i,
  }));
}

export function deriveViewFromLive(live) {
  if (!live) return null;
  return {
    user: live.user,
    current_balance: live.user?.current_balance ?? 0,
    expenses: live.expenses,
    incomes: live.incomes,
    allocation: live.allocation,
    horizon: live.horizon,
    crisis: live.crisis,
  };
}

export function deriveSandboxView(sandbox, live) {
  if (!sandbox) return null;
  const allocation = calculateAllocation({
    balance: sandbox.current_balance,
    expenses: sandbox.expenses,
    subscriptions: sandbox.subscriptions || live?.subscriptions || [],
  });
  const horizon = simulateHorizon({
    balance: sandbox.current_balance,
    expenses: sandbox.expenses,
    incomes: sandbox.incomes,
    subscriptions: sandbox.subscriptions || live?.subscriptions || [],
  });
  const crisis = evaluateCrisisState(horizon);
  return {
    user: live?.user,
    current_balance: sandbox.current_balance,
    expenses: sandbox.expenses,
    incomes: sandbox.incomes,
    allocation,
    horizon,
    crisis,
    isSandbox: true,
  };
}

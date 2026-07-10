/**
 * Frontend mirror of the backend allocation/horizon/crisis algorithms,
 * used by Sandbox / Future Lab to project hypothetical changes without persisting.
 * The backend remains the source of truth for live data.
 */

export const TIER_NAMES = { 1: 'Survival', 2: 'Stability', 3: 'Strategic', 4: 'Lifestyle' };

export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function toMonthly(amount, frequency) {
  const a = Number(amount) || 0;
  switch (frequency) {
    case 'weekly':
      return roundMoney((a * 52) / 12);
    case 'yearly':
      return roundMoney(a / 12);
    case 'one-time':
      return 0;
    case 'monthly':
    default:
      return roundMoney(a);
  }
}

function localKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateAllocation({ balance, expenses, subscriptions = [] }) {
  const tierTotals = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const e of expenses) {
    if (e.is_active === false) continue;
    tierTotals[e.priority_tier] = (tierTotals[e.priority_tier] || 0) + toMonthly(e.amount, e.frequency);
  }
  for (const s of subscriptions) {
    if (s.is_active === false || s.active === false) continue;
    tierTotals[4] += toMonthly(s.amount, 'monthly');
  }

  let remaining = Number(balance) || 0;
  const tiers = [1, 2, 3, 4].map((tier) => {
    const total_cost = tierTotals[tier] || 0;
    let allocated;
    let status;
    if (remaining >= total_cost) {
      allocated = total_cost;
      status = 'FUNDED';
      remaining -= total_cost;
    } else if (remaining > 0) {
      allocated = remaining;
      status = 'PARTIAL';
      remaining = 0;
    } else {
      allocated = 0;
      status = 'UNFUNDED';
    }
    return {
      tier,
      name: TIER_NAMES[tier],
      total_cost,
      allocated,
      status,
      coverage_percentage: total_cost > 0 ? Math.min(100, (allocated / total_cost) * 100) : 100,
    };
  });

  return {
    current_balance: Number(balance) || 0,
    tiers,
    surplus: remaining,
    total_expenses: Object.values(tierTotals).reduce((a, b) => a + b, 0),
    calculated_at: new Date().toISOString(),
  };
}

export function simulateHorizon({ balance, expenses, incomes, subscriptions = [] }) {
  const expenseMonthly = expenses
    .filter((e) => e.is_active !== false)
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);
  const subscriptionMonthly = (subscriptions || [])
    .filter((s) => s.is_active !== false && s.active !== false)
    .reduce((sum, s) => sum + toMonthly(s.amount, 'monthly'), 0);
  const daily_burn_rate = (expenseMonthly + subscriptionMonthly) / 30;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = localKey(today);

  const incomeByDate = new Map();
  for (const i of incomes || []) {
    const amount = Number(i.amount || 0);
    if (i.is_recurring) {
      const anchorKey = String(i.expected_date).slice(0, 10);
      const parts = anchorKey.split('-').map(Number);
      if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) continue;
      const dayOfMonth = parts[2];
      for (let month = 0; month < 12; month += 1) {
        const d = new Date(today.getFullYear(), today.getMonth() + month, dayOfMonth);
        if (d < today) continue;
        const key = localKey(d);
        incomeByDate.set(key, (incomeByDate.get(key) || 0) + amount);
      }
    } else {
      const key = String(i.expected_date).slice(0, 10);
      if (key < todayKey) continue;
      incomeByDate.set(key, (incomeByDate.get(key) || 0) + amount);
    }
  }

  const expenseByDate = new Map();
  for (const e of expenses) {
    if (e.is_active === false || e.frequency !== 'one-time' || !e.due_date) continue;
    const key = String(e.due_date).slice(0, 10);
    if (key < todayKey) continue;
    expenseByDate.set(key, (expenseByDate.get(key) || 0) + Number(e.amount || 0));
  }

  let running = Number(balance) || 0;
  let exhaustion_date = null;
  const daily_snapshots = [];
  let incomeEventCount = 0;

  for (let day = 0; day < 365; day += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const key = localKey(date);
    const income_today = incomeByDate.get(key) || 0;
    const expense_today = expenseByDate.get(key) || 0;
    if (income_today > 0) incomeEventCount += 1;
    running += income_today;
    running -= expense_today;
    running -= daily_burn_rate;
    daily_snapshots.push({ date: key, balance: Math.max(running, 0), income_received: income_today });
    if (running <= 0) {
      exhaustion_date = key;
      break;
    }
  }

  const days_remaining = exhaustion_date
    ? Math.max(0, Math.round((new Date(`${exhaustion_date}T00:00:00`) - today) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    current_balance: Number(balance) || 0,
    daily_burn_rate,
    exhaustion_date,
    days_remaining,
    daily_snapshots,
    income_events_projected: incomeEventCount,
    calculated_at: new Date().toISOString(),
  };
}

export function evaluateCrisisState(horizon) {
  const days = horizon?.days_remaining;
  if (days === null || days === undefined || days > 30) {
    return { state: 'NORMAL', severity: 1, days_remaining: days, message: 'Your finances are stable. All essential expenses are covered.' };
  }
  if (days >= 7) {
    return { state: 'CAUTION', severity: 2, days_remaining: days, message: `You have ${days} days of runway remaining. Consider reducing non-essential expenses.` };
  }
  return { state: 'CRISIS', severity: 3, days_remaining: days, message: `URGENT: Only ${days} days until funds are exhausted. Immediate action required.` };
}

/**
 * Future Lab — human-language insights, journey, recommendations, smart questions.
 * Client-side only; turns sandbox numbers into answers people understand.
 */
import { calculateAllocation, simulateHorizon, evaluateCrisisState, toMonthly } from './algorithms';
import { deriveSandboxView } from './financeMetrics';
import { generateTempId } from './sandbox';
import { toInputDate } from './dates';

export const SCENARIO_CARDS = [
  { id: 'income-up', emoji: '➕', label: 'Increase income', desc: 'Raise, side gig, or bonus', type: 'income', recurring: true },
  { id: 'lose-job', emoji: '➖', label: 'Lose a job', desc: 'Remove or cut a main income', type: 'lose-income' },
  { id: 'rent-up', emoji: '🏠', label: 'Rent increases', desc: 'Housing costs go up', type: 'expense-bump', category: 'rent', monthly: 3000 },
  { id: 'vehicle', emoji: '🚗', label: 'Buy a vehicle', desc: 'Loan or large purchase', type: 'expense-once', amount: 250000, name: 'Vehicle purchase' },
  { id: 'college', emoji: '🎓', label: 'Start college', desc: 'Tuition and fees', type: 'expense-monthly', amount: 15000, name: 'College tuition' },
  { id: 'wedding', emoji: '💍', label: 'Get married', desc: 'One-time celebration costs', type: 'expense-once', amount: 150000, name: 'Wedding costs' },
  { id: 'child', emoji: '👶', label: 'Have a child', desc: 'Ongoing childcare costs', type: 'expense-monthly', amount: 12000, name: 'Childcare' },
  { id: 'medical', emoji: '🏥', label: 'Medical emergency', desc: 'Unexpected hospital bill', type: 'expense-once', amount: 50000, name: 'Medical emergency', tier: 1 },
  { id: 'vacation', emoji: '✈️', label: 'Vacation', desc: 'Trip or holiday spend', type: 'expense-once', amount: 40000, name: 'Vacation' },
  { id: 'subscription', emoji: '📱', label: 'New subscription', desc: 'Monthly app or service', type: 'expense-monthly', amount: 1500, name: 'New subscription', tier: 4 },
  { id: 'custom', emoji: '✨', label: 'Custom event', desc: 'Anything you imagine', type: 'custom' },
];

const TIMELINE_MARKERS = [
  { key: 'today', day: 0, label: 'Today' },
  { key: 'week1', day: 7, label: 'Week 1' },
  { key: 'week2', day: 14, label: 'Week 2' },
  { key: 'month1', day: 30, label: 'Month 1' },
  { key: 'month2', day: 60, label: 'Month 2' },
  { key: 'month3', day: 90, label: 'Month 3' },
];

export function applyPlaygroundOverlay(sandbox, playground = {}) {
  if (!sandbox) return null;
  const incomeMult = 1 + (Number(playground.incomeBoost) || 0) / 100;
  const expenseMult = 1 + (Number(playground.expenseBoost) || 0) / 100;
  const inflation = 1 + (Number(playground.inflation) || 0) / 100;
  const balanceAdj = Number(playground.balanceAdjust) || 0;

  const incomes = (sandbox.incomes || []).map((i) => ({
    ...i,
    amount: Math.round(Number(i.amount) * incomeMult),
  }));

  const expenses = (sandbox.expenses || []).map((e) => ({
    ...e,
    amount: Math.round(Number(e.amount) * expenseMult * inflation),
  }));

  return {
    ...sandbox,
    current_balance: Math.max(0, Number(sandbox.current_balance) + balanceAdj),
    incomes,
    expenses,
  };
}

export function projectViews(sandbox, live, playground) {
  const effective = applyPlaygroundOverlay(sandbox, playground);
  const scenarioView = deriveSandboxView(effective, live);
  const baselineView = sandbox?.snapshot
    ? deriveSandboxView(sandbox.snapshot, live)
    : scenarioView;
  return { effective, scenarioView, baselineView };
}

function formatDays(days) {
  if (days === null || days === undefined) return 'more than a year';
  if (days === 0) return 'today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

function formatDateHuman(dateStr) {
  if (!dateStr) return 'soon';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function survivalLevel(days) {
  if (days === null || days === undefined || days > 90) {
    return { level: 'stable', emoji: '🟢', label: 'Stable', color: '#34D399' };
  }
  if (days > 30) return { level: 'warning', emoji: '🟡', label: 'Warning', color: '#FBBF24' };
  if (days > 7) return { level: 'risky', emoji: '🟠', label: 'Risky', color: '#FB923C' };
  return { level: 'critical', emoji: '🔴', label: 'Critical', color: '#F87171' };
}

function riskLabel(days) {
  if (days === null || days === undefined || days > 90) return 'LOW';
  if (days > 30) return 'MEDIUM';
  if (days > 7) return 'HIGH';
  return 'CRITICAL';
}

export function buildInsightSummary(baselineView, scenarioView, sandbox) {
  const liveDays = baselineView?.horizon?.days_remaining;
  const scenarioDays = scenarioView?.horizon?.days_remaining;
  const daysDelta = liveDays != null && scenarioDays != null
    ? scenarioDays - liveDays
    : scenarioDays != null ? scenarioDays : null;

  const liveBurn = (baselineView?.horizon?.daily_burn_rate || 0) * 30;
  const scenarioBurn = (scenarioView?.horizon?.daily_burn_rate || 0) * 30;
  const burnDelta = scenarioBurn - liveBurn;

  const survival = survivalLevel(scenarioDays);
  const stable = survival.level === 'stable';

  let headline = stable
    ? 'You look financially safe in this scenario.'
    : survival.level === 'warning'
      ? 'Your budget becomes tighter — pay attention.'
      : survival.level === 'risky'
        ? 'Your budget becomes unstable.'
        : 'Danger — you could run out of money very soon.';

  let mainReason = 'Your spending and income in this scenario don\'t leave enough cushion.';
  if (burnDelta > 5000) mainReason = 'Monthly spending increased more than your income can cover.';
  else if (daysDelta != null && daysDelta < -30) mainReason = 'A large expense or lost income shortened your safety window.';
  else if (scenarioView?.crisis?.state === 'CRISIS') mainReason = 'Emergency costs or high bills are eating through your balance too fast.';

  const monthlyGap = Math.max(0, scenarioBurn - (scenarioView?.incomes || []).reduce((s, i) => {
    if (i.is_recurring) return s + Number(i.amount);
    return s;
  }, 0));

  const fixIncome = Math.ceil(monthlyGap / 1000) * 1000 || Math.ceil(burnDelta / 2 / 1000) * 1000 || 8000;
  const fixExpense = Math.ceil(Math.min(burnDelta, liveBurn * 0.3) / 1000) * 1000 || 5000;

  const confidence = stable ? 82 : survival.level === 'warning' ? 58 : survival.level === 'risky' ? 38 : 18;
  const healthScore = Math.min(100, Math.max(5, confidence + (daysDelta != null && daysDelta > 0 ? 10 : -10)));

  return {
    headline,
    stable,
    survival,
    risk: riskLabel(scenarioDays),
    liveDays,
    scenarioDays,
    daysDelta,
    exhaustionDate: scenarioView?.horizon?.exhaustion_date,
    mainReason,
    fixes: [
      monthlyGap > 0 ? `Earn at least NPR ${fixIncome.toLocaleString()} more each month` : null,
      burnDelta > 0 ? `Cut spending by about NPR ${fixExpense.toLocaleString()} per month` : null,
    ].filter(Boolean),
    plainSurvival: scenarioDays === null
      ? 'You can likely afford this lifestyle for over a year.'
      : `You'll run out of money in ${formatDays(scenarioDays)}.`,
    plainLive: liveDays === null
      ? 'Right now, you are safe for over a year.'
      : `Right now, you could last ${formatDays(liveDays)}.`,
    confidence,
    healthScore,
    monthlyGap,
  };
}

export function buildScenarioStory(sandbox, insight) {
  const steps = [];
  if (!sandbox?.snapshot) return steps;

  const snap = sandbox.snapshot;
  const balanceChanged = Number(sandbox.current_balance) !== Number(snap.current_balance);
  if (balanceChanged) {
    steps.push({
      type: 'balance',
      text: Number(sandbox.current_balance) > Number(snap.current_balance)
        ? `You started with more money in this scenario (NPR ${Number(sandbox.current_balance).toLocaleString()}).`
        : `You started with less money in this scenario.`,
    });
  }

  const curIncomeIds = new Set((sandbox.incomes || []).map((i) => i.income_id));
  for (const i of snap.incomes) {
    if (!curIncomeIds.has(i.income_id)) {
      steps.push({ type: 'bad', text: `You lost income: ${i.source_name} (NPR ${Number(i.amount).toLocaleString()}).` });
    }
  }
  for (const i of sandbox.incomes || []) {
    if (String(i.income_id).startsWith('temp_')) {
      steps.push({
        type: 'good',
        text: `You received ${i.is_recurring ? 'ongoing' : 'one-time'} income: ${i.source_name} (+NPR ${Number(i.amount).toLocaleString()}).`,
      });
    }
  }

  const curExpIds = new Set((sandbox.expenses || []).map((e) => e.expense_id));
  for (const e of snap.expenses) {
    if (!curExpIds.has(e.expense_id)) {
      steps.push({ type: 'good', text: `You cut an expense: ${e.name} (saves NPR ${Number(e.amount).toLocaleString()}).` });
    }
  }
  for (const e of sandbox.expenses || []) {
    if (String(e.expense_id).startsWith('temp_')) {
      const urgent = e.priority_tier <= 1 || /medical|emergency/i.test(e.name);
      steps.push({
        type: urgent ? 'bad' : 'neutral',
        text: `You added ${e.frequency === 'one-time' ? 'a one-time' : 'a monthly'} cost: ${e.name} (−NPR ${Number(e.amount).toLocaleString()}).`,
      });
    }
  }

  if (insight?.daysDelta != null && insight.daysDelta !== 0) {
    steps.push({
      type: insight.daysDelta < 0 ? 'bad' : 'good',
      text: insight.daysDelta < 0
        ? `Your safety window shrank by ${Math.abs(insight.daysDelta)} days.`
        : `Your safety window grew by ${insight.daysDelta} days.`,
    });
  }

  if (insight?.exhaustionDate) {
    steps.push({
      type: 'bad',
      text: `You could run out of money on ${formatDateHuman(insight.exhaustionDate)}.`,
    });
  } else if (steps.length > 0) {
    steps.push({ type: 'good', text: 'In this scenario, your money may last beyond 3 months.' });
  }

  return steps;
}

export function buildMoneyJourney(scenarioView, maxNodes = 14) {
  const balance = Number(scenarioView?.current_balance) || 0;
  const snapshots = scenarioView?.horizon?.daily_snapshots || [];
  const incomes = scenarioView?.incomes || [];
  const expenses = scenarioView?.expenses || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);

  const nodes = [{
    id: 'start',
    emoji: '📍',
    label: 'Today',
    detail: `You have NPR ${balance.toLocaleString()}`,
    amount: balance,
    delta: null,
    tone: 'neutral',
  }];

  const events = [];

  for (const i of incomes) {
    const key = String(i.expected_date).slice(0, 10);
    if (!i.is_recurring && key < todayKey) continue;
    events.push({
      date: key,
      sort: new Date(key).getTime(),
      emoji: '💰',
      label: i.source_name,
      delta: Number(i.amount),
      tone: 'good',
    });
    if (i.is_recurring) {
      for (let m = 1; m <= 3; m += 1) {
        const d = new Date(today.getFullYear(), today.getMonth() + m, new Date(key).getDate());
        events.push({
          date: d.toISOString().slice(0, 10),
          sort: d.getTime(),
          emoji: '💼',
          label: `${i.source_name} (monthly)`,
          delta: Number(i.amount),
          tone: 'good',
        });
      }
    }
  }

  for (const e of expenses) {
    if (e.frequency === 'one-time' && e.due_date) {
      const key = String(e.due_date).slice(0, 10);
      if (key < todayKey) continue;
      events.push({
        date: key,
        sort: new Date(key).getTime(),
        emoji: e.priority_tier <= 1 ? '🏥' : '🧾',
        label: e.name,
        delta: -Number(e.amount),
        tone: e.priority_tier <= 1 ? 'bad' : 'neutral',
      });
    }
  }

  const weeklyBurn = (scenarioView?.horizon?.daily_burn_rate || 0) * 7;
  for (let w = 1; w <= 12; w += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() + w * 7);
    events.push({
      date: d.toISOString().slice(0, 10),
      sort: d.getTime(),
      emoji: '🛒',
      label: 'Living costs (week)',
      delta: -weeklyBurn,
      tone: 'neutral',
    });
  }

  events.sort((a, b) => a.sort - b.sort);

  let running = balance;
  for (const ev of events) {
    if (nodes.length >= maxNodes) break;
    running += ev.delta;
    const isCritical = running <= 0;
    nodes.push({
      id: `ev-${nodes.length}`,
      emoji: isCritical ? '🚨' : ev.emoji,
      label: ev.label,
      detail: isCritical
        ? 'Balance becomes negative'
        : `Balance ≈ NPR ${Math.max(0, Math.round(running)).toLocaleString()}`,
      amount: Math.max(0, Math.round(running)),
      delta: ev.delta,
      tone: isCritical ? 'critical' : ev.tone,
    });
    if (isCritical) break;
  }

  return nodes;
}

export function buildInteractiveTimeline(scenarioView) {
  const snapshots = scenarioView?.horizon?.daily_snapshots || [];
  const incomes = scenarioView?.incomes || [];
  const expenses = scenarioView?.expenses || [];

  return TIMELINE_MARKERS.map((marker) => {
    const snap = snapshots[marker.day] || snapshots[snapshots.length - 1];
    const balance = snap ? Math.round(snap.balance) : null;
    const date = snap?.date;

    const events = [];
    if (marker.day === 0) events.push({ icon: '📍', text: 'Starting point' });

    for (const i of incomes) {
      const key = String(i.expected_date).slice(0, 10);
      if (date && key === date) events.push({ icon: '💰', text: `Income: ${i.source_name}` });
    }
    for (const e of expenses) {
      if (e.frequency === 'one-time' && e.due_date && String(e.due_date).slice(0, 10) === date) {
        events.push({ icon: '🧾', text: `Bill: ${e.name}` });
      }
    }

    const warning = balance != null && balance < 10000
      ? { icon: '⚠️', text: balance <= 0 ? 'Money runs out' : 'Balance getting low' }
      : null;

    return {
      ...marker,
      balance,
      date,
      events,
      warning,
      incomeReceived: snap?.income_received || 0,
    };
  });
}

export function buildRecommendations(sandbox, scenarioView, baselineView) {
  const recs = [];
  const expenses = sandbox?.expenses || [];
  const tier4 = expenses.filter((e) => e.priority_tier === 4 && e.is_active !== false);
  const tier1Monthly = expenses
    .filter((e) => e.priority_tier === 1)
    .reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const totalMonthly = expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const housing = expenses.filter((e) => /rent|housing|mortgage/i.test(e.name));
  const housingMonthly = housing.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const incomeMonthly = (sandbox?.incomes || []).filter((i) => i.is_recurring).reduce((s, i) => s + Number(i.amount), 0);

  const liveDays = baselineView?.horizon?.days_remaining ?? 365;
  const scenarioDays = scenarioView?.horizon?.days_remaining ?? 365;

  tier4.slice(0, 3).forEach((e, idx) => {
    const save = Math.round(toMonthly(e.amount, e.frequency));
    if (save < 500) return;
    recs.push({
      id: `cut-${e.expense_id}`,
      title: `Cut ${e.name}`,
      stars: 5 - Math.min(idx, 2),
      impact: `Save NPR ${save.toLocaleString()}/month`,
      riskReduction: `+${Math.min(25, Math.round((save / Math.max(totalMonthly, 1)) * 40))}%`,
      difficulty: 'Easy',
      action: { type: 'delete-expense', id: e.expense_id },
    });
  });

  const bigOneTime = expenses.filter((e) => e.frequency === 'one-time' && Number(e.amount) > 50000);
  bigOneTime.forEach((e) => {
    recs.push({
      id: `delay-${e.expense_id}`,
      title: `Delay ${e.name}`,
      stars: 4,
      impact: `Keep NPR ${Number(e.amount).toLocaleString()} in your pocket`,
      riskReduction: `+${Math.min(90, Math.round(Number(e.amount) / Math.max((scenarioView?.horizon?.daily_burn_rate || 1) * 30, 1) * 2))} days`,
      difficulty: 'Medium',
      action: { type: 'delete-expense', id: e.expense_id },
    });
  });

  if (scenarioDays < liveDays && incomeMonthly > 0) {
    const need = Math.ceil(((totalMonthly - incomeMonthly) / 2) / 1000) * 1000;
    if (need > 0) {
      recs.push({
        id: 'boost-income',
        title: 'Add part-time income',
        stars: 5,
        impact: `+NPR ${need.toLocaleString()}/month`,
        riskReduction: `+${Math.max(14, Math.round(need / Math.max(totalMonthly, 1) * 30))}%`,
        difficulty: 'Hard',
        action: { type: 'add-income', amount: need, recurring: true, name: 'Side income' },
      });
    }
  }

  if (housingMonthly > 0 && incomeMonthly > 0 && housingMonthly / incomeMonthly > 0.35) {
    recs.push({
      id: 'housing',
      title: 'Review housing costs',
      stars: 4,
      impact: 'Housing is over 35% of income',
      riskReduction: 'Stability',
      difficulty: 'Hard',
      action: null,
    });
  }

  return recs.slice(0, 6);
}

export function buildFinancialDoctor(scenarioView, insight) {
  const issues = [];
  const days = scenarioView?.horizon?.days_remaining;
  const expenses = scenarioView?.expenses || [];
  const incomes = scenarioView?.incomes || [];
  const monthlyBurn = (scenarioView?.horizon?.daily_burn_rate || 0) * 30;
  const incomeMonthly = incomes.filter((i) => i.is_recurring).reduce((s, i) => s + Number(i.amount), 0);
  const balance = Number(scenarioView?.current_balance) || 0;

  if (days !== null && days !== undefined && days <= 37) {
    issues.push({
      severity: 'high',
      title: 'Running out of money soon',
      explanation: `At this pace, funds may be gone in ${formatDays(days)}.`,
      fix: 'Cut lifestyle spending or add income this month.',
    });
  }

  if (balance < monthlyBurn) {
    issues.push({
      severity: 'high',
      title: 'Emergency fund insufficient',
      explanation: 'Your balance is less than one month of expenses.',
      fix: 'Pause large purchases and build a cash buffer.',
    });
  }

  const housing = expenses.filter((e) => /rent|housing/i.test(e.name));
  const housingCost = housing.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  if (incomeMonthly > 0 && housingCost / incomeMonthly > 0.42) {
    issues.push({
      severity: 'medium',
      title: 'Housing costs exceed 42%',
      explanation: 'Too much of your income goes to rent or housing.',
      fix: 'Consider a cheaper place or adding a roommate.',
    });
  }

  if (incomeMonthly > 0 && (incomeMonthly - monthlyBurn) / incomeMonthly < 0.1) {
    issues.push({
      severity: 'medium',
      title: 'Savings rate below healthy level',
      explanation: 'Very little is left after bills each month.',
      fix: 'Trim subscriptions and dining first.',
    });
  }

  const lifestyle = expenses.filter((e) => e.priority_tier === 4).reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  if (lifestyle > monthlyBurn * 0.25) {
    issues.push({
      severity: 'low',
      title: 'Lifestyle inflation detected',
      explanation: 'Fun spending takes a large share of your budget.',
      fix: 'Keep one subscription, cancel the rest for 90 days.',
    });
  }

  if (incomes.length <= 1 && incomeMonthly > 0) {
    issues.push({
      severity: 'medium',
      title: 'Income unstable',
      explanation: 'You rely on very few income sources.',
      fix: 'Add a backup income stream if possible.',
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: 'low',
      title: 'No major problems detected',
      explanation: insight?.plainSurvival || 'This scenario looks manageable.',
      fix: 'Keep monitoring weekly.',
    });
  }

  return issues;
}

export function parseSmartQuestion(text) {
  const q = text.toLowerCase().trim();
  const actions = [];

  const amountMatch = q.match(/npr?\s*([\d,]+)|([\d,]+)\s*npr|(\d+)k/i);
  const parseAmt = () => {
    if (!amountMatch) return null;
    const raw = amountMatch[1] || amountMatch[2] || amountMatch[3];
    if (!raw) return null;
    if (amountMatch[3] && !amountMatch[1]) return Number(raw) * 1000;
    return Number(String(raw).replace(/,/g, ''));
  };

  if (/lose.*job|unemployed|fired|laid off/.test(q)) {
    actions.push({ type: 'lose-largest-income' });
  }
  if (/iphone|buy.*phone|new phone/.test(q)) {
    actions.push({ type: 'add-expense-once', name: 'New phone', amount: parseAmt() || 150000, tier: 4 });
  }
  if (/bonus|windfall|extra income|receive/.test(q) && (parseAmt() || /50.?000|50000/.test(q))) {
    actions.push({ type: 'add-income-once', name: 'Bonus', amount: parseAmt() || 50000 });
  }
  if (/salary.*(\d+)\s*%|income.*(\d+)\s*%|raise.*(\d+)/.test(q)) {
    const pct = Number(q.match(/(\d+)\s*%/)?.[1] || 20);
    actions.push({ type: 'income-boost-percent', percent: pct });
  }
  if (/medical|hospital|emergency/.test(q)) {
    actions.push({ type: 'add-expense-once', name: 'Medical emergency', amount: parseAmt() || 50000, tier: 1 });
  }
  if (/rent.*increas|rent up/.test(q)) {
    actions.push({ type: 'bump-rent', amount: parseAmt() || 3000 });
  }
  if (/netflix|subscription|spotify/.test(q)) {
    actions.push({ type: 'add-expense-monthly', name: 'New subscription', amount: parseAmt() || 900, tier: 4 });
  }
  if (/vacation|trip|travel/.test(q)) {
    actions.push({ type: 'add-expense-once', name: 'Vacation', amount: parseAmt() || 40000, tier: 4 });
  }
  if (/car|vehicle/.test(q)) {
    actions.push({ type: 'add-expense-once', name: 'Vehicle', amount: parseAmt() || 250000, tier: 3 });
  }
  if (/twins|baby|child/.test(q)) {
    actions.push({ type: 'add-expense-monthly', name: 'Childcare', amount: parseAmt() || 12000, tier: 2 });
  }
  if (/move.*city/.test(q)) {
    actions.push({ type: 'bump-rent', amount: parseAmt() || 5000 });
    actions.push({ type: 'add-expense-once', name: 'Moving costs', amount: 30000, tier: 2 });
  }

  if (actions.length === 0 && q.length > 3) {
    return { understood: false, message: 'Try: "What if I lose my job?" or "What if I get NPR 50,000?"' };
  }

  return { understood: true, actions, message: `Got it — simulating: "${text}"` };
}

export function applyScenarioCard(sandbox, card, custom = {}) {
  if (!sandbox) return sandbox;
  const next = JSON.parse(JSON.stringify(sandbox));
  const today = toInputDate(new Date());

  const addIncome = (name, amount, recurring = false) => {
    next.incomes.push({
      source_name: name,
      amount,
      expected_date: today,
      is_recurring: recurring,
      income_id: generateTempId(),
      is_temporary: true,
    });
  };

  const addExpense = (name, amount, frequency, tier = 4) => {
    next.expenses.push({
      name,
      amount,
      frequency,
      priority_tier: tier,
      due_date: frequency === 'one-time' ? today : null,
      expense_id: generateTempId(),
      is_temporary: true,
      is_active: true,
    });
  };

  switch (card.type) {
    case 'income':
      addIncome(custom.name || 'Extra income', Number(custom.amount) || 10000, card.recurring);
      break;
    case 'lose-income': {
      const recurring = [...next.incomes].filter((i) => i.is_recurring).sort((a, b) => Number(b.amount) - Number(a.amount));
      const target = recurring[0];
      if (target) next.incomes = next.incomes.filter((i) => i.income_id !== target.income_id);
      else if (next.incomes.length) next.incomes = next.incomes.slice(1);
      break;
    }
    case 'expense-bump': {
      const rent = next.expenses.find((e) => /rent|housing/i.test(e.name));
      if (rent) rent.amount = Number(rent.amount) + (card.monthly || 3000);
      else addExpense('Rent', card.monthly || 3000, 'monthly', 1);
      break;
    }
    case 'expense-once':
      addExpense(custom.name || card.name, Number(custom.amount) || card.amount, 'one-time', card.tier || 4);
      break;
    case 'expense-monthly':
      addExpense(custom.name || card.name, Number(custom.amount) || card.amount, 'monthly', card.tier || 3);
      break;
    default:
      break;
  }
  return next;
}

export function applySmartActions(sandbox, actions) {
  let next = JSON.parse(JSON.stringify(sandbox));
  const today = toInputDate(new Date());

  for (const a of actions) {
    switch (a.type) {
      case 'lose-largest-income': {
        const recurring = [...next.incomes].filter((i) => i.is_recurring).sort((x, y) => Number(y.amount) - Number(x.amount));
        if (recurring[0]) next.incomes = next.incomes.filter((i) => i.income_id !== recurring[0].income_id);
        break;
      }
      case 'add-income-once':
        next.incomes.push({ source_name: a.name, amount: a.amount, expected_date: today, is_recurring: false, income_id: generateTempId(), is_temporary: true });
        break;
      case 'income-boost-percent':
        next.incomes = next.incomes.map((i) => ({ ...i, amount: Math.round(Number(i.amount) * (1 + a.percent / 100)) }));
        break;
      case 'add-expense-once':
        next.expenses.push({ name: a.name, amount: a.amount, frequency: 'one-time', priority_tier: a.tier || 4, due_date: today, expense_id: generateTempId(), is_temporary: true, is_active: true });
        break;
      case 'add-expense-monthly':
        next.expenses.push({ name: a.name, amount: a.amount, frequency: 'monthly', priority_tier: a.tier || 4, due_date: null, expense_id: generateTempId(), is_temporary: true, is_active: true });
        break;
      case 'bump-rent': {
        const rent = next.expenses.find((e) => /rent|housing/i.test(e.name));
        if (rent) rent.amount = Number(rent.amount) + a.amount;
        else next.expenses.push({ name: 'Rent', amount: a.amount, frequency: 'monthly', priority_tier: 1, due_date: null, expense_id: generateTempId(), is_temporary: true, is_active: true });
        break;
      }
      default:
        break;
    }
  }
  return next;
}

export function applyRecommendationAction(sandbox, action) {
  if (!action) return sandbox;
  const next = JSON.parse(JSON.stringify(sandbox));
  const today = toInputDate(new Date());

  if (action.type === 'delete-expense') {
    next.expenses = next.expenses.filter((e) => e.expense_id !== action.id);
  }
  if (action.type === 'add-income') {
    next.incomes.push({
      source_name: action.name || 'Side income',
      amount: action.amount,
      expected_date: today,
      is_recurring: action.recurring,
      income_id: generateTempId(),
      is_temporary: true,
    });
  }
  return next;
}

export function computeStressScore(insight, doctorIssues) {
  const high = doctorIssues.filter((i) => i.severity === 'high').length;
  const med = doctorIssues.filter((i) => i.severity === 'medium').length;
  let score = 100 - high * 28 - med * 12;
  if (insight?.risk === 'CRITICAL') score -= 20;
  if (insight?.risk === 'HIGH') score -= 10;
  return Math.max(5, Math.min(100, Math.round(score)));
}

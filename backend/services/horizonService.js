/**
 * FILE: services/horizonService.js
 *
 * PURPOSE:
 * Risk Horizon Simulator — projects daily balance up to 365 days forward.
 *
 * RESPONSIBILITIES:
 * - Compute daily_burn_rate from recurring monthly expenses + subscriptions / 30
 * - Project one-time and recurring incomes onto calendar dates
 * - Subtract daily burn each day until balance ≤ 0 or 365 days elapse
 *
 * EXECUTED WHEN:
 * GET /dashboard, GET /horizon, recommendationService
 *
 * DEPENDENCIES:
 * User, Expense, Income, Subscription models; utils/finance.toMonthly
 *
 * LIMITATIONS (documented for maintainers):
 * - One-time expenses due today or earlier adjust stored balance at entry time
 * - Future one-time expenses are deducted on their due date in this simulation
 * - Recurring incomes repeat monthly on the same day-of-month for 12 months
 * - Active subscriptions add to monthly burn (treated as monthly costs)
 * - Uses average daily burn, not calendar-accurate weekly/yearly scheduling
 */
const { Op } = require('sequelize');
const { User, Expense, Income, Subscription } = require('../models');
const { toMonthly } = require('../utils/finance');
const { todayDateKey } = require('../utils/balanceAdjustments');

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Expand incomes into a date → amount map for the next ~12 months.
 * Recurring rows use day-of-month from expected_date (matches frontend algorithms.js).
 */
function buildIncomeByDate(incomes, today, todayKey) {
  const incomeByDate = new Map();

  for (const income of incomes) {
    const amount = Number(income.amount || 0);
    if (amount <= 0) continue;

    if (income.is_recurring) {
      const anchorKey = String(income.expected_date).slice(0, 10);
      const parts = anchorKey.split('-').map(Number);
      if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) continue;
      const dayOfMonth = parts[2];

      for (let month = 0; month < 12; month += 1) {
        const d = new Date(today.getFullYear(), today.getMonth() + month, dayOfMonth);
        if (d < today) continue;
        const key = localDateKey(d);
        incomeByDate.set(key, (incomeByDate.get(key) || 0) + amount);
      }
    } else {
      const key = String(income.expected_date).slice(0, 10);
      if (key < todayKey) continue;
      incomeByDate.set(key, (incomeByDate.get(key) || 0) + amount);
    }
  }

  return incomeByDate;
}

/**
 * Simulates daily balance for up to 365 days using income events and daily burn.
 *
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<object>} Horizon with daily_snapshots, exhaustion_date, days_remaining
 */
async function simulateHorizon(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const expenses = await Expense.findAll({
    where: { user_id: userId, is_active: true },
  });

  const subscriptions = await Subscription.findAll({
    where: { user_id: userId, is_active: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = todayDateKey();

  // Load one-time incomes from today forward, plus all recurring (even if anchor is past).
  const incomes = await Income.findAll({
    where: {
      user_id: userId,
      [Op.or]: [
        { is_recurring: true },
        { expected_date: { [Op.gte]: todayKey } },
      ],
    },
    order: [['expected_date', 'ASC']],
  });

  const expenseMonthly = expenses.reduce(
    (sum, expense) => sum + toMonthly(expense.amount, expense.frequency),
    0
  );
  const subscriptionMonthly = subscriptions.reduce(
    (sum, sub) => sum + toMonthly(sub.amount, 'monthly'),
    0
  );
  const monthlyTotal = expenseMonthly + subscriptionMonthly;
  const daily_burn_rate = monthlyTotal / 30;

  const incomeByDate = buildIncomeByDate(incomes, today, todayKey);

  const expenseByDate = new Map();
  for (const expense of expenses) {
    if (expense.frequency !== 'one-time' || !expense.due_date) continue;
    const key = String(expense.due_date).slice(0, 10);
    if (key <= todayKey) continue;
    expenseByDate.set(key, (expenseByDate.get(key) || 0) + Number(expense.amount || 0));
  }

  let running = Number(user.current_balance) || 0;
  let exhaustion_date = null;
  const daily_snapshots = [];
  let incomeEventCount = 0;

  for (let day = 0; day < 365; day += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const key = localDateKey(date);
    const income_today = incomeByDate.get(key) || 0;
    const expense_today = expenseByDate.get(key) || 0;
    if (income_today > 0) incomeEventCount += 1;
    running += income_today;
    running -= expense_today;
    running -= daily_burn_rate;
    daily_snapshots.push({
      date: key,
      balance: Math.max(running, 0),
      income_received: income_today,
    });
    if (running <= 0) {
      exhaustion_date = key;
      break;
    }
  }

  const days_remaining = exhaustion_date
    ? Math.max(0, Math.round((new Date(`${exhaustion_date}T00:00:00`) - today) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    userId,
    current_balance: Number(user.current_balance) || 0,
    daily_burn_rate,
    exhaustion_date,
    days_remaining,
    daily_snapshots,
    income_events_projected: incomeEventCount,
    subscription_monthly: subscriptionMonthly,
    calculated_at: new Date().toISOString(),
  };
}

module.exports = { simulateHorizon };

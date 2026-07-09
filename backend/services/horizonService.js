/**
 * FILE: services/horizonService.js
 *
 * PURPOSE:
 * Risk Horizon Simulator — projects daily balance up to 365 days forward.
 *
 * RESPONSIBILITIES:
 * - Compute daily_burn_rate from recurring monthly expenses / 30
 * - Add future incomes on expected_date
 * - Subtract daily burn each day until balance ≤ 0 or 365 days elapse
 *
 * EXECUTED WHEN:
 * GET /dashboard, GET /horizon, recommendationService
 *
 * DEPENDENCIES:
 * User, Expense, Income models; utils/finance.toMonthly
 *
 * LIMITATIONS (documented for maintainers):
 * - One-time expenses due today or earlier adjust stored balance at entry time
 * - Future one-time expenses are deducted on their due date in this simulation
 * - Uses average daily burn, not calendar-accurate weekly/yearly scheduling
 */
const { Op } = require('sequelize');
const { User, Expense, Income } = require('../models');
const { toMonthly } = require('../utils/finance');
const { todayDateKey } = require('../utils/balanceAdjustments');

/**
 * Simulates daily balance for up to 365 days using income events and daily burn.
 *
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<object>} Horizon with daily_snapshots, exhaustion_date, days_remaining
 */
async function simulateHorizon(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const expenses = await Expense.findAll({
    where: { user_id: userId, is_active: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = todayDateKey();

  const incomes = await Income.findAll({
    where: {
      user_id: userId,
      expected_date: { [Op.gte]: todayKey },
    },
    order: [['expected_date', 'ASC']],
  });

  const monthlyTotal = expenses.reduce(
    (sum, expense) => sum + toMonthly(expense.amount, expense.frequency),
    0
  );
  const daily_burn_rate = monthlyTotal / 30;

  const incomeByDate = new Map();
  for (const income of incomes) {
    const key = String(income.expected_date).slice(0, 10);
    if (!income.is_recurring && key <= todayKey) continue;
    incomeByDate.set(key, (incomeByDate.get(key) || 0) + Number(income.amount || 0));
  }

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

  for (let day = 0; day < 365; day += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${dd}`;
    const income_today = incomeByDate.get(key) || 0;
    const expense_today = expenseByDate.get(key) || 0;
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
    ? Math.max(0, Math.round((new Date(exhaustion_date) - today) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    userId,
    current_balance: Number(user.current_balance) || 0,
    daily_burn_rate,
    exhaustion_date,
    days_remaining,
    daily_snapshots,
    income_events_projected: incomes.length,
    calculated_at: new Date().toISOString(),
  };
}

module.exports = { simulateHorizon };

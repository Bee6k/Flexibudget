/**
 * FILE: services/allocationService.js
 *
 * PURPOSE:
 * Waterfall Allocation Engine — distributes current balance across priority tiers 1→4.
 *
 * RESPONSIBILITIES:
 * - Sum monthly cost per tier from active expenses
 * - Fold active subscriptions into tier 4 (Lifestyle) monthly cost
 * - Allocate balance sequentially; mark FUNDED | PARTIAL | UNFUNDED
 * - Compute surplus after tier 4
 *
 * EXECUTED WHEN:
 * GET /dashboard, GET /allocation
 *
 * DEPENDENCIES:
 * User, Expense, Subscription models; utils/finance.toMonthly
 *
 * BUSINESS RULES:
 * - Tier 1 (Essentials) fully funded before tier 2 receives anything
 * - One-time expenses do not count toward tier monthly totals
 * - Subscriptions are monthly Lifestyle costs (no separate priority field)
 *
 * MAINTAINER NOTES:
 * Any change requires allocation.test.js + manual dashboard verification.
 */
const { User, Expense, Subscription } = require('../models');
const { TIER_NAMES, toMonthly } = require('../utils/finance');

/**
 * Runs the waterfall allocation algorithm for a user.
 *
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<object>} Allocation result with tiers, surplus, total_expenses
 */
async function calculateAllocation(userId) {
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

  const tierTotals = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const expense of expenses) {
    tierTotals[expense.priority_tier] =
      (tierTotals[expense.priority_tier] || 0) + toMonthly(expense.amount, expense.frequency);
  }
  for (const sub of subscriptions) {
    tierTotals[4] += toMonthly(sub.amount, 'monthly');
  }

  let remaining = Number(user.current_balance) || 0;
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
    userId,
    current_balance: Number(user.current_balance) || 0,
    tiers,
    surplus: remaining,
    total_expenses: Object.values(tierTotals).reduce((sum, value) => sum + value, 0),
    calculated_at: new Date().toISOString(),
  };
}

module.exports = { calculateAllocation };

/**
 * FILE: services/recommendationService.js
 *
 * PURPOSE:
 * Generates actionable advice when runway is CAUTION or CRISIS.
 *
 * RESPONSIBILITIES:
 * - Re-run horizon + crisis evaluation
 * - Suggest removing tier-4 (Lifestyle) expenses with estimated days gained
 * - Return top 3 recommendations sorted by impact
 *
 * EXECUTED WHEN:
 * GET /recommendations, FinanceContext (when crisis ≠ NORMAL)
 *
 * BUSINESS RULE:
 * Only tier-4 cuts are suggested — treated as non-essential by product design.
 */
const { Expense } = require('../models');
const { toMonthly } = require('../utils/finance');
const { simulateHorizon } = require('./horizonService');
const { evaluateCrisisState } = require('./crisisService');

async function generateRecommendations(userId) {
  const horizon = await simulateHorizon(userId);
  const crisis = evaluateCrisisState(horizon);

  if (crisis.state === 'NORMAL') return [];

  const tier4Expenses = await Expense.findAll({
    where: { user_id: userId, is_active: true, priority_tier: 4 },
  });

  const daily_burn = horizon.daily_burn_rate || 0;
  const currentDays = horizon.days_remaining ?? 0;

  const recommendations = tier4Expenses.map((expense, index) => {
    const monthly_cost = toMonthly(expense.amount, expense.frequency);
    const days_gained = daily_burn > 0 ? Math.round(monthly_cost / daily_burn) : 0;
    const newDays = currentDays + days_gained;
    const newExhaustion = horizon.exhaustion_date
      ? new Date(`${horizon.exhaustion_date}T00:00:00`)
      : new Date();
    if (horizon.exhaustion_date) {
      newExhaustion.setDate(newExhaustion.getDate() + days_gained);
    }
    const y = newExhaustion.getFullYear();
    const m = String(newExhaustion.getMonth() + 1).padStart(2, '0');
    const d = String(newExhaustion.getDate()).padStart(2, '0');

    return {
      recommendation_id: `rec_${expense.id}_${index}`,
      action: 'remove_expense',
      expense_id: expense.id,
      expense_name: expense.name,
      tier: 4,
      monthly_cost,
      impact: {
        days_gained,
        new_exhaustion_date: horizon.exhaustion_date ? `${y}-${m}-${d}` : null,
      },
      explanation: {
        cause: `Your current runway is only ${currentDays} days.`,
        rule: 'Tier 4 (Lifestyle) expenses are non-essential and can be safely cut.',
        consequence: `Removing ${expense.name} will extend your runway from ${currentDays} days to ${newDays} days.`,
      },
    };
  });

  return recommendations.sort((a, b) => b.impact.days_gained - a.impact.days_gained).slice(0, 3);
}

module.exports = { generateRecommendations };

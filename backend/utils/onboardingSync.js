const { Expense, Income } = require('../models');

/**
 * Marks onboarding complete for returning users who already set up data
 * (e.g. finished income review before the flag was saved, or legacy accounts).
 */
async function syncOnboardingCompleted(user) {
  if (!user || user.onboarding_completed) return user;

  const [expenseCount, incomeCount] = await Promise.all([
    Expense.count({ where: { user_id: user.id, is_active: true } }),
    Income.count({ where: { user_id: user.id } }),
  ]);

  const hasSetupData = expenseCount > 0 || incomeCount > 0 || Boolean(user.archetype);

  if (hasSetupData) {
    await user.update({ onboarding_completed: true });
    await user.reload();
  }

  return user;
}

module.exports = { syncOnboardingCompleted };

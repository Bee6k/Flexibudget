/**
 * FILE: utils/finance.js
 *
 * PURPOSE:
 * Core financial math shared by allocation, horizon, and recommendation services.
 *
 * RESPONSIBILITIES:
 * - Convert expense frequencies to monthly equivalents (toMonthly)
 * - Export tier name constants for API responses
 *
 * USED BY:
 * - allocationService, horizonService, recommendationService
 * - dashboardController (indirectly via services)
 *
 * BUSINESS RULES:
 * - one-time expenses return 0 monthly burn (they are not recurring obligations)
 * - weekly → amount * 52 / 12; yearly → amount / 12
 *
 * MAINTAINER NOTES:
 * Changing toMonthly() affects crisis state, runway, and recommendations system-wide.
 * Full regression: npm test (finance.test.js, allocation.test.js)
 */
const TIER_NAMES = { 1: 'Survival', 2: 'Stability', 3: 'Strategic', 4: 'Lifestyle' };

/**
 * Converts an expense amount to its monthly equivalent for burn-rate calculations.
 *
 * @param {number|string} amount - Raw expense amount
 * @param {string} frequency - weekly | monthly | yearly | one-time
 * @returns {number} Monthly contribution (0 for one-time)
 *
 * WHY one-time returns 0:
 * One-off purchases should not inflate recurring daily burn; otherwise runway is pessimistic.
 */
function toMonthly(amount, frequency) {
  const a = Number(amount) || 0;
  switch (frequency) {
    case 'weekly':
      return (a * 52) / 12;
    case 'yearly':
      return a / 12;
    case 'one-time':
      return 0;
    case 'monthly':
    default:
      return a;
  }
}

module.exports = { TIER_NAMES, toMonthly };

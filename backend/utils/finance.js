/**
 * FILE: utils/finance.js
 *
 * PURPOSE:
 * Core financial math shared by allocation, horizon, and recommendation services.
 */
const TIER_NAMES = { 1: 'Survival', 2: 'Stability', 3: 'Strategic', 4: 'Lifestyle' };

/** Round to 2 decimal places (paisa) at money boundaries. */
function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/**
 * Converts an expense amount to its monthly equivalent for burn-rate calculations.
 * weekly → amount * 52 / 12; yearly → amount / 12; one-time → 0
 */
function toMonthly(amount, frequency) {
  const a = Number(amount) || 0;
  let result;
  switch (frequency) {
    case 'weekly':
      result = (a * 52) / 12;
      break;
    case 'yearly':
      result = a / 12;
      break;
    case 'one-time':
      return 0;
    case 'monthly':
    default:
      result = a;
  }
  return roundMoney(result);
}

module.exports = { TIER_NAMES, toMonthly, roundMoney };

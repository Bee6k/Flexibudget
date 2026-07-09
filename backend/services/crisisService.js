/**
 * FILE: services/crisisService.js
 *
 * PURPOSE:
 * Crisis State Evaluator — classifies financial runway severity from horizon output.
 *
 * RESPONSIBILITIES:
 * - Map days_remaining to NORMAL | CAUTION | CRISIS
 * - Provide user-facing message and severity level
 *
 * EXECUTED WHEN:
 * After simulateHorizon in dashboard and recommendations pipeline
 *
 * BUSINESS RULES:
 * - NORMAL: > 30 days runway (or never exhausts within simulation)
 * - CAUTION: 7–30 days
 * - CRISIS: < 7 days
 *
 * MAINTAINER NOTES:
 * Threshold changes affect ExecutiveDashboard crisis UI, notifications, and Advise page visibility.
 */
/**
 * Evaluates crisis severity from horizon simulation results.
 *
 * @param {object} horizonResult - Output of simulateHorizon()
 * @returns {{ state, severity, days_remaining, message, evaluated_at }}
 */
function evaluateCrisisState(horizonResult) {
  const days_remaining = horizonResult?.days_remaining;

  if (days_remaining === null || days_remaining === undefined || days_remaining > 30) {
    return {
      state: 'NORMAL',
      severity: 1,
      days_remaining,
      message: 'Your finances are stable. All essential expenses are covered.',
      evaluated_at: new Date().toISOString(),
    };
  }

  if (days_remaining >= 7) {
    return {
      state: 'CAUTION',
      severity: 2,
      days_remaining,
      message: `You have ${days_remaining} days of runway remaining. Consider reducing non-essential expenses.`,
      evaluated_at: new Date().toISOString(),
    };
  }

  return {
    state: 'CRISIS',
    severity: 3,
    days_remaining,
    message: `URGENT: Only ${days_remaining} days until funds are exhausted. Immediate action required.`,
    evaluated_at: new Date().toISOString(),
  };
}

module.exports = { evaluateCrisisState };

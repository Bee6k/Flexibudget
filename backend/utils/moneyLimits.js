/**
 * Money bounds aligned with MySQL DECIMAL column sizes.
 * Keep route validators in sync with models to avoid opaque Sequelize 400s.
 */
module.exports = {
  /** DECIMAL(10,2) — expenses, incomes, subscriptions */
  AMOUNT_MAX: 99_999_999.99,
  /** DECIMAL(12,2) — goals, user.current_balance */
  BALANCE_MAX: 9_999_999_999.99,
  /** DECIMAL(14,2) — investments */
  INVESTMENT_MAX: 999_999_999_999.99,
};

/**
 * Adjusts user.current_balance for one-time cash events (paid/received today or earlier).
 * All mutations use a transaction + row lock to prevent lost updates.
 */
const sequelize = require('../config/database');
const User = require('../models/User');
const { roundMoney } = require('./finance');

function todayDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shouldApplyOneTimeNow(dateValue) {
  if (!dateValue) return true;
  const key = String(dateValue).slice(0, 10);
  return key <= todayDateKey();
}

async function adjustBalance(user, delta, externalTx = null) {
  const run = async (transaction) => {
    const locked = await User.findByPk(user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!locked) {
      const err = new Error('User not found.');
      err.status = 404;
      throw err;
    }
    const next = roundMoney(Math.max(0, Number(locked.current_balance) + Number(delta)));
    await locked.update({ current_balance: next }, { transaction });
    await locked.reload({ transaction });
    user.setDataValue('current_balance', locked.current_balance);
    return locked;
  };

  if (externalTx) return run(externalTx);
  return sequelize.transaction(run);
}

async function applyOneTimeExpense(user, amount, tx) {
  return adjustBalance(user, -Number(amount), tx);
}

async function reverseOneTimeExpense(user, amount, tx) {
  return adjustBalance(user, Number(amount), tx);
}

async function applyOneTimeIncome(user, amount, tx) {
  return adjustBalance(user, Number(amount), tx);
}

async function reverseOneTimeIncome(user, amount, tx) {
  return adjustBalance(user, -Number(amount), tx);
}

async function reconcileOneTimeExpenseBalance(user, before, after, tx) {
  const wasApplied = before.frequency === 'one-time' && shouldApplyOneTimeNow(before.due_date);
  const nowApplied = after.frequency === 'one-time' && shouldApplyOneTimeNow(after.due_date);
  let delta = 0;
  if (wasApplied) delta += Number(before.amount);
  if (nowApplied) delta -= Number(after.amount);
  if (delta === 0) return user;
  return adjustBalance(user, delta, tx);
}

async function reconcileOneTimeIncomeBalance(user, before, after, tx) {
  const wasApplied = !before.is_recurring && shouldApplyOneTimeNow(before.expected_date);
  const nowApplied = !after.is_recurring && shouldApplyOneTimeNow(after.expected_date);
  let delta = 0;
  if (wasApplied) delta -= Number(before.amount);
  if (nowApplied) delta += Number(after.amount);
  if (delta === 0) return user;
  return adjustBalance(user, delta, tx);
}

module.exports = {
  todayDateKey,
  shouldApplyOneTimeNow,
  adjustBalance,
  applyOneTimeExpense,
  reverseOneTimeExpense,
  applyOneTimeIncome,
  reverseOneTimeIncome,
  reconcileOneTimeExpenseBalance,
  reconcileOneTimeIncomeBalance,
};

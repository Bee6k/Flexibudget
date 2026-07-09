/**
 * Adjusts user.current_balance for one-time cash events (paid/received today or earlier).
 * Recurring expenses still only affect burn rate, not the stored balance.
 */

/** Local calendar date as YYYY-MM-DD (avoids UTC shift on toISOString). */
function todayDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** One-time expense/income counts against balance when due today or in the past (or undated). */
function shouldApplyOneTimeNow(dateValue) {
  if (!dateValue) return true;
  const key = String(dateValue).slice(0, 10);
  return key <= todayDateKey();
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

async function adjustBalance(user, delta) {
  const next = roundMoney(Math.max(0, Number(user.current_balance) + delta));
  await user.update({ current_balance: next });
  await user.reload();
  return user;
}

async function applyOneTimeExpense(user, amount) {
  return adjustBalance(user, -Number(amount));
}

async function reverseOneTimeExpense(user, amount) {
  return adjustBalance(user, Number(amount));
}

async function applyOneTimeIncome(user, amount) {
  return adjustBalance(user, Number(amount));
}

async function reverseOneTimeIncome(user, amount) {
  return adjustBalance(user, -Number(amount));
}

/**
 * Reconcile balance when a one-time expense is edited.
 */
async function reconcileOneTimeExpenseBalance(user, before, after) {
  const wasApplied = before.frequency === 'one-time' && shouldApplyOneTimeNow(before.due_date);
  const nowApplied = after.frequency === 'one-time' && shouldApplyOneTimeNow(after.due_date);
  let delta = 0;
  if (wasApplied) delta += Number(before.amount);
  if (nowApplied) delta -= Number(after.amount);
  if (delta === 0) return user;
  return adjustBalance(user, delta);
}

/**
 * Reconcile balance when a one-time income is edited.
 */
async function reconcileOneTimeIncomeBalance(user, before, after) {
  const wasApplied = !before.is_recurring && shouldApplyOneTimeNow(before.expected_date);
  const nowApplied = !after.is_recurring && shouldApplyOneTimeNow(after.expected_date);
  let delta = 0;
  if (wasApplied) delta -= Number(before.amount);
  if (nowApplied) delta += Number(after.amount);
  if (delta === 0) return user;
  return adjustBalance(user, delta);
}

module.exports = {
  todayDateKey,
  shouldApplyOneTimeNow,
  applyOneTimeExpense,
  reverseOneTimeExpense,
  applyOneTimeIncome,
  reverseOneTimeIncome,
  reconcileOneTimeExpenseBalance,
  reconcileOneTimeIncomeBalance,
};

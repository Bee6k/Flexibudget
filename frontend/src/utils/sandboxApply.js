import { createExpense, updateExpense, deleteExpense } from '../services/expenses';
import { createIncome, updateIncome, deleteIncome } from '../services/incomes';
import { updateBalance } from '../services/users';
import {
  isTempId,
  expensePayload,
  incomePayload,
  expenseChanged,
  incomeChanged,
} from './sandbox';

/**
 * Persists all sandbox mutations to the live API (existing endpoints only).
 */
export async function applySandboxToLive(live, sandbox) {
  if (!live || !sandbox) throw new Error('Missing live or sandbox data');

  if (Number(sandbox.current_balance) !== Number(live.user?.current_balance)) {
    await updateBalance(Number(sandbox.current_balance));
  }

  const liveExpenseMap = new Map((live.expenses || []).map((e) => [e.expense_id, e]));
  const sandboxExpenseIds = new Set();

  for (const e of sandbox.expenses || []) {
    if (isTempId(e.expense_id)) {
      await createExpense(expensePayload(e));
    } else {
      sandboxExpenseIds.add(e.expense_id);
      const orig = liveExpenseMap.get(e.expense_id);
      if (orig && expenseChanged(orig, e)) {
        await updateExpense(e.expense_id, expensePayload(e));
      }
    }
  }

  for (const id of liveExpenseMap.keys()) {
    if (!sandboxExpenseIds.has(id)) {
      await deleteExpense(id);
    }
  }

  const liveIncomeMap = new Map((live.incomes || []).map((i) => [i.income_id, i]));
  const sandboxIncomeIds = new Set();

  for (const i of sandbox.incomes || []) {
    if (isTempId(i.income_id)) {
      await createIncome(incomePayload(i));
    } else {
      sandboxIncomeIds.add(i.income_id);
      const orig = liveIncomeMap.get(i.income_id);
      if (orig && incomeChanged(orig, i)) {
        await updateIncome(i.income_id, incomePayload(i));
      }
    }
  }

  for (const id of liveIncomeMap.keys()) {
    if (!sandboxIncomeIds.has(id)) {
      await deleteIncome(id);
    }
  }
}

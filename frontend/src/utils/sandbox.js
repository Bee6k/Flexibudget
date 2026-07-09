/**
 * Sandbox mode utilities — temp IDs, snapshots, diff helpers.
 * All sandbox state lives in React; apply uses existing API services.
 */

export function generateTempId(prefix = 'temp') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isTempId(id) {
  return id != null && String(id).startsWith('temp_');
}

export function createSandboxFromLive(live) {
  if (!live) return null;
  const expenses = JSON.parse(JSON.stringify(live.expenses || []));
  const incomes = JSON.parse(JSON.stringify(live.incomes || []));
  const current_balance = live.user?.current_balance ?? 0;
  return {
    setupMode: 'current',
    current_balance,
    expenses,
    incomes,
    snapshot: {
      current_balance,
      expenses: JSON.parse(JSON.stringify(expenses)),
      incomes: JSON.parse(JSON.stringify(incomes)),
    },
    createdAt: new Date().toISOString(),
  };
}

/** Blank scenario — user builds income & expenses from scratch. */
export function createEmptySandbox(startingBalance = 0) {
  const balance = Number(startingBalance) || 0;
  return {
    setupMode: 'fresh',
    current_balance: balance,
    expenses: [],
    incomes: [],
    snapshot: {
      current_balance: balance,
      expenses: [],
      incomes: [],
    },
    createdAt: new Date().toISOString(),
  };
}

export function resetSandboxData(sandbox) {
  if (!sandbox?.snapshot) return sandbox;
  return {
    ...sandbox,
    current_balance: sandbox.snapshot.current_balance,
    expenses: JSON.parse(JSON.stringify(sandbox.snapshot.expenses)),
    incomes: JSON.parse(JSON.stringify(sandbox.snapshot.incomes)),
  };
}

function expensePayload(e) {
  return {
    name: e.name,
    amount: e.amount,
    frequency: e.frequency,
    priority_tier: e.priority_tier,
    due_date: e.due_date || null,
  };
}

function incomePayload(i) {
  return {
    source_name: i.source_name,
    amount: i.amount,
    expected_date: i.expected_date,
    is_recurring: Boolean(i.is_recurring),
  };
}

export function expenseChanged(a, b) {
  return (
    a.name !== b.name
    || Number(a.amount) !== Number(b.amount)
    || a.frequency !== b.frequency
    || Number(a.priority_tier) !== Number(b.priority_tier)
    || String(a.due_date || '') !== String(b.due_date || '')
  );
}

export function incomeChanged(a, b) {
  return (
    a.source_name !== b.source_name
    || Number(a.amount) !== Number(b.amount)
    || String(a.expected_date) !== String(b.expected_date)
    || Boolean(a.is_recurring) !== Boolean(b.is_recurring)
  );
}

export { expensePayload, incomePayload };


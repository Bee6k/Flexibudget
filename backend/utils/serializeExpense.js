function serializeExpense(expense) {
  if (!expense) return null;
  const plain = expense.get ? expense.get({ plain: true }) : expense;
  return {
    expense_id: plain.id,
    user_id: plain.user_id,
    name: plain.name,
    amount: Number(plain.amount),
    frequency: plain.frequency,
    priority_tier: plain.priority_tier,
    due_date: plain.due_date || null,
    is_active: plain.is_active !== false,
  };
}

function groupExpensesByTier(expenses) {
  const grouped = { 1: [], 2: [], 3: [], 4: [] };
  for (const expense of expenses) {
    const serialized = serializeExpense(expense);
    const tier = serialized.priority_tier;
    if (grouped[tier]) grouped[tier].push(serialized);
  }
  return grouped;
}

module.exports = { serializeExpense, groupExpensesByTier };

function serializeIncome(income) {
  if (!income) return null;
  const plain = income.get ? income.get({ plain: true }) : income;
  return {
    income_id: plain.id,
    user_id: plain.user_id,
    source_name: plain.source_name,
    amount: Number(plain.amount),
    expected_date: plain.expected_date,
    is_recurring: Boolean(plain.is_recurring),
  };
}

module.exports = serializeIncome;

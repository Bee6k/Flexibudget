function serializeInvestment(investment) {
  if (!investment) return null;
  const plain = investment.get ? investment.get({ plain: true }) : investment;
  return {
    id: plain.id,
    name: plain.name,
    type: plain.asset_type,
    value: Number(plain.value),
    change: Number(plain.change_pct),
    active: plain.is_active !== false,
  };
}

module.exports = { serializeInvestment };

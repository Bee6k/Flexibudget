function serializeGoal(goal) {
  if (!goal) return null;
  const plain = goal.get ? goal.get({ plain: true }) : goal;
  return {
    id: plain.id,
    name: plain.name,
    target: Number(plain.target_amount),
    current: Number(plain.current_amount),
    active: plain.is_active !== false,
  };
}

module.exports = { serializeGoal };

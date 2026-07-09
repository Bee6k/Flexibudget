function serializeSubscription(subscription) {
  if (!subscription) return null;
  const plain = subscription.get ? subscription.get({ plain: true }) : subscription;
  return {
    id: plain.id,
    name: plain.name,
    amount: Number(plain.amount),
    due_day: plain.due_day,
    active: plain.is_active !== false,
  };
}

module.exports = { serializeSubscription };

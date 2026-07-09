function serializeUser(user) {
  if (!user) return null;
  const plain = user.get ? user.get({ plain: true }) : user;
  return {
    id: plain.id,
    name: plain.name,
    email: plain.email,
    current_balance: Number(plain.current_balance ?? 0),
    archetype: plain.archetype ?? null,
    onboarding_completed: Boolean(plain.onboarding_completed),
  };
}

module.exports = serializeUser;

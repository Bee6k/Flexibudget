const serializeUser = require('../utils/serializeUser');
const { syncOnboardingCompleted } = require('../utils/onboardingSync');

async function getProfile(req, res, next) {
  try {
    const user = await syncOnboardingCompleted(req.user);
    res.json(serializeUser(user));
  } catch (err) {
    next(err);
  }
}

async function updateBalance(req, res, next) {
  try {
    const balance = Number(req.body.current_balance);
    if (Number.isNaN(balance) || balance < 0) {
      return res.status(400).json({ error: 'Balance must be zero or greater.' });
    }
    await req.user.update({ current_balance: balance });
    res.json(serializeUser(req.user));
  } catch (err) {
    next(err);
  }
}

async function completeOnboarding(req, res, next) {
  try {
    const { archetype, onboarding_completed = true } = req.body;
    const updates = { onboarding_completed: Boolean(onboarding_completed) };
    if (archetype) updates.archetype = archetype;
    await req.user.update(updates);
    await req.user.reload();
    res.json(serializeUser(req.user));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateBalance, completeOnboarding };

const { Subscription } = require('../models');
const { serializeSubscription } = require('../utils/serializeSubscription');

async function findOwnedSubscription(userId, subscriptionId) {
  const subscription = await Subscription.findOne({
    where: { id: subscriptionId, user_id: userId, is_active: true },
  });
  if (!subscription) {
    const err = new Error('Subscription not found.');
    err.status = 404;
    throw err;
  }
  return subscription;
}

async function listSubscriptions(req, res, next) {
  try {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.user.id, is_active: true },
      order: [['name', 'ASC']],
    });
    res.json(subscriptions.map(serializeSubscription));
  } catch (err) {
    next(err);
  }
}

async function createSubscription(req, res, next) {
  try {
    const subscription = await Subscription.create({
      user_id: req.user.id,
      name: req.body.name.trim(),
      amount: req.body.amount,
      due_day: req.body.due_day,
    });
    res.status(201).json(serializeSubscription(subscription));
  } catch (err) {
    next(err);
  }
}

async function updateSubscription(req, res, next) {
  try {
    const subscription = await findOwnedSubscription(req.user.id, req.params.subscriptionId);
    await subscription.update({
      name: req.body.name.trim(),
      amount: req.body.amount,
      due_day: req.body.due_day,
      is_active: req.body.active !== false,
    });
    res.json(serializeSubscription(subscription));
  } catch (err) {
    next(err);
  }
}

async function deleteSubscription(req, res, next) {
  try {
    const subscription = await findOwnedSubscription(req.user.id, req.params.subscriptionId);
    await subscription.update({ is_active: false });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listSubscriptions, createSubscription, updateSubscription, deleteSubscription };

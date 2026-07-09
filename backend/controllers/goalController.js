const { Goal } = require('../models');
const { serializeGoal } = require('../utils/serializeGoal');

async function findOwnedGoal(userId, goalId) {
  const goal = await Goal.findOne({
    where: { id: goalId, user_id: userId, is_active: true },
  });
  if (!goal) {
    const err = new Error('Goal not found.');
    err.status = 404;
    throw err;
  }
  return goal;
}

async function listGoals(req, res, next) {
  try {
    const goals = await Goal.findAll({
      where: { user_id: req.user.id, is_active: true },
      order: [['id', 'DESC']],
    });
    res.json(goals.map(serializeGoal));
  } catch (err) {
    next(err);
  }
}

async function createGoal(req, res, next) {
  try {
    const goal = await Goal.create({
      user_id: req.user.id,
      name: req.body.name.trim(),
      target_amount: req.body.target,
      current_amount: req.body.current ?? 0,
    });
    res.status(201).json(serializeGoal(goal));
  } catch (err) {
    next(err);
  }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await findOwnedGoal(req.user.id, req.params.goalId);
    await goal.update({
      name: req.body.name.trim(),
      target_amount: req.body.target,
      current_amount: req.body.current ?? 0,
    });
    res.json(serializeGoal(goal));
  } catch (err) {
    next(err);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const goal = await findOwnedGoal(req.user.id, req.params.goalId);
    await goal.update({ is_active: false });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listGoals, createGoal, updateGoal, deleteGoal };

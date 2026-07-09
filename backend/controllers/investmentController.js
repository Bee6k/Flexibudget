const { Investment } = require('../models');
const { serializeInvestment } = require('../utils/serializeInvestment');

async function findOwnedInvestment(userId, investmentId) {
  const investment = await Investment.findOne({
    where: { id: investmentId, user_id: userId, is_active: true },
  });
  if (!investment) {
    const err = new Error('Investment not found.');
    err.status = 404;
    throw err;
  }
  return investment;
}

async function listInvestments(req, res, next) {
  try {
    const investments = await Investment.findAll({
      where: { user_id: req.user.id, is_active: true },
      order: [['id', 'DESC']],
    });
    res.json(investments.map(serializeInvestment));
  } catch (err) {
    next(err);
  }
}

async function createInvestment(req, res, next) {
  try {
    const investment = await Investment.create({
      user_id: req.user.id,
      name: req.body.name.trim(),
      asset_type: req.body.type,
      value: req.body.value,
      change_pct: req.body.change ?? 0,
    });
    res.status(201).json(serializeInvestment(investment));
  } catch (err) {
    next(err);
  }
}

async function updateInvestment(req, res, next) {
  try {
    const investment = await findOwnedInvestment(req.user.id, req.params.investmentId);
    await investment.update({
      name: req.body.name.trim(),
      asset_type: req.body.type,
      value: req.body.value,
      change_pct: req.body.change ?? 0,
    });
    res.json(serializeInvestment(investment));
  } catch (err) {
    next(err);
  }
}

async function deleteInvestment(req, res, next) {
  try {
    const investment = await findOwnedInvestment(req.user.id, req.params.investmentId);
    await investment.update({ is_active: false });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvestments, createInvestment, updateInvestment, deleteInvestment };

const { Income } = require('../models');
const serializeIncome = require('../utils/serializeIncome');
const {
  shouldApplyOneTimeNow,
  applyOneTimeIncome,
  reverseOneTimeIncome,
  reconcileOneTimeIncomeBalance,
} = require('../utils/balanceAdjustments');

async function findOwnedIncome(userId, incomeId) {
  const income = await Income.findOne({ where: { id: incomeId, user_id: userId } });
  if (!income) {
    const err = new Error('Income not found.');
    err.status = 404;
    throw err;
  }
  return income;
}

async function listIncomes(req, res, next) {
  try {
    const incomes = await Income.findAll({
      where: { user_id: req.user.id },
      order: [['expected_date', 'ASC']],
    });
    res.json(incomes.map(serializeIncome));
  } catch (err) {
    next(err);
  }
}

async function createIncome(req, res, next) {
  try {
    const isRecurring = Boolean(req.body.is_recurring);
    const income = await Income.create({
      user_id: req.user.id,
      source_name: req.body.source_name.trim(),
      amount: req.body.amount,
      expected_date: req.body.expected_date,
      is_recurring: isRecurring,
    });
    if (!isRecurring && shouldApplyOneTimeNow(income.expected_date)) {
      await applyOneTimeIncome(req.user, income.amount);
    }
    res.status(201).json(serializeIncome(income));
  } catch (err) {
    next(err);
  }
}

async function updateIncome(req, res, next) {
  try {
    const income = await findOwnedIncome(req.user.id, req.params.incomeId);
    const before = income.get({ plain: true });
    const isRecurring = Boolean(req.body.is_recurring);
    await income.update({
      source_name: req.body.source_name.trim(),
      amount: req.body.amount,
      expected_date: req.body.expected_date,
      is_recurring: isRecurring,
    });
    await reconcileOneTimeIncomeBalance(req.user, before, income.get({ plain: true }));
    res.json(serializeIncome(income));
  } catch (err) {
    next(err);
  }
}

async function deleteIncome(req, res, next) {
  try {
    const income = await findOwnedIncome(req.user.id, req.params.incomeId);
    if (!income.is_recurring && shouldApplyOneTimeNow(income.expected_date)) {
      await reverseOneTimeIncome(req.user, income.amount);
    }
    await income.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
};

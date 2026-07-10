/**
 * FILE: controllers/expenseController.js
 * CRUD for expenses with IDOR-safe ownership and transactional balance updates.
 */
const sequelize = require('../config/database');
const { Expense } = require('../models');
const { serializeExpense } = require('../utils/serializeExpense');
const {
  shouldApplyOneTimeNow,
  applyOneTimeExpense,
  reverseOneTimeExpense,
  reconcileOneTimeExpenseBalance,
} = require('../utils/balanceAdjustments');

async function findOwnedExpense(userId, expenseId, transaction) {
  const expense = await Expense.findOne({
    where: { id: expenseId, user_id: userId, is_active: true },
    transaction,
  });
  if (!expense) {
    const err = new Error('Expense not found.');
    err.status = 404;
    throw err;
  }
  return expense;
}

async function listExpenses(req, res, next) {
  try {
    const where = { user_id: req.user.id, is_active: true };
    if (req.query.tier) where.priority_tier = Number(req.query.tier);

    const expenses = await Expense.findAll({
      where,
      order: [['priority_tier', 'ASC'], ['name', 'ASC']],
    });

    res.json(expenses.map(serializeExpense));
  } catch (err) {
    next(err);
  }
}

async function createExpense(req, res, next) {
  try {
    const expense = await sequelize.transaction(async (transaction) => {
      const created = await Expense.create(
        {
          user_id: req.user.id,
          name: req.body.name.trim(),
          amount: req.body.amount,
          frequency: req.body.frequency,
          priority_tier: req.body.priority_tier,
          due_date: req.body.due_date || null,
        },
        { transaction }
      );
      if (created.frequency === 'one-time' && shouldApplyOneTimeNow(created.due_date)) {
        await applyOneTimeExpense(req.user, created.amount, transaction);
      }
      return created;
    });
    res.status(201).json(serializeExpense(expense));
  } catch (err) {
    next(err);
  }
}

async function bulkCreateExpenses(req, res, next) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const created = await sequelize.transaction(async (transaction) => {
      const rows = await Expense.bulkCreate(
        items.map((item) => ({
          user_id: req.user.id,
          name: item.name.trim(),
          amount: item.amount,
          frequency: item.frequency || 'monthly',
          priority_tier: item.priority_tier,
          due_date: item.due_date || null,
        })),
        { transaction }
      );

      let oneTimeTotal = 0;
      for (const row of rows) {
        if (row.frequency === 'one-time' && shouldApplyOneTimeNow(row.due_date)) {
          oneTimeTotal += Number(row.amount);
        }
      }
      if (oneTimeTotal > 0) {
        await applyOneTimeExpense(req.user, oneTimeTotal, transaction);
      }
      return rows;
    });
    res.status(201).json(created.map(serializeExpense));
  } catch (err) {
    next(err);
  }
}

async function updateExpense(req, res, next) {
  try {
    const expense = await sequelize.transaction(async (transaction) => {
      const owned = await findOwnedExpense(req.user.id, req.params.expenseId, transaction);
      const before = owned.get({ plain: true });
      await owned.update(
        {
          name: req.body.name.trim(),
          amount: req.body.amount,
          frequency: req.body.frequency,
          priority_tier: req.body.priority_tier,
          due_date: req.body.due_date || null,
        },
        { transaction }
      );
      await reconcileOneTimeExpenseBalance(req.user, before, owned.get({ plain: true }), transaction);
      return owned;
    });
    res.json(serializeExpense(expense));
  } catch (err) {
    next(err);
  }
}

async function deleteExpense(req, res, next) {
  try {
    await sequelize.transaction(async (transaction) => {
      const expense = await findOwnedExpense(req.user.id, req.params.expenseId, transaction);
      if (expense.frequency === 'one-time' && shouldApplyOneTimeNow(expense.due_date)) {
        await reverseOneTimeExpense(req.user, expense.amount, transaction);
      }
      await expense.update({ is_active: false }, { transaction });
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listExpenses,
  createExpense,
  bulkCreateExpenses,
  updateExpense,
  deleteExpense,
};

/**
 * FILE: controllers/expenseController.js
 *
 * PURPOSE:
 * CRUD handlers for user expenses with IDOR-safe ownership checks.
 *
 * RESPONSIBILITIES:
 * - listExpenses, createExpense, bulkCreateExpenses, updateExpense, deleteExpense
 * - findOwnedExpense: always filters by user_id + is_active
 *
 * SECURITY NOTES:
 * - PERMISSION CHECK: every mutation verifies expense belongs to req.user.id
 * - Soft delete preserves data (is_active=false)
 *
 * USED BY:
 * - routes/expenseRoutes.js, OnboardingWizard (bulk)
 */
const { Expense } = require('../models');
const { serializeExpense } = require('../utils/serializeExpense');
const {
  shouldApplyOneTimeNow,
  applyOneTimeExpense,
  reverseOneTimeExpense,
  reconcileOneTimeExpenseBalance,
} = require('../utils/balanceAdjustments');

async function findOwnedExpense(userId, expenseId) {
  const expense = await Expense.findOne({
    where: { id: expenseId, user_id: userId, is_active: true },
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
    const expense = await Expense.create({
      user_id: req.user.id,
      name: req.body.name.trim(),
      amount: req.body.amount,
      frequency: req.body.frequency,
      priority_tier: req.body.priority_tier,
      due_date: req.body.due_date || null,
    });
    if (expense.frequency === 'one-time' && shouldApplyOneTimeNow(expense.due_date)) {
      await applyOneTimeExpense(req.user, expense.amount);
    }
    res.status(201).json(serializeExpense(expense));
  } catch (err) {
    next(err);
  }
}

async function bulkCreateExpenses(req, res, next) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const created = await Expense.bulkCreate(
      items.map((item) => ({
        user_id: req.user.id,
        name: item.name.trim(),
        amount: item.amount,
        frequency: item.frequency || 'monthly',
        priority_tier: item.priority_tier,
        due_date: item.due_date || null,
      }))
    );
    res.status(201).json(created.map(serializeExpense));
  } catch (err) {
    next(err);
  }
}

async function updateExpense(req, res, next) {
  try {
    const expense = await findOwnedExpense(req.user.id, req.params.expenseId);
    const before = expense.get({ plain: true });
    await expense.update({
      name: req.body.name.trim(),
      amount: req.body.amount,
      frequency: req.body.frequency,
      priority_tier: req.body.priority_tier,
      due_date: req.body.due_date || null,
    });
    await reconcileOneTimeExpenseBalance(req.user, before, expense.get({ plain: true }));
    res.json(serializeExpense(expense));
  } catch (err) {
    next(err);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const expense = await findOwnedExpense(req.user.id, req.params.expenseId);
    if (expense.frequency === 'one-time' && shouldApplyOneTimeNow(expense.due_date)) {
      await reverseOneTimeExpense(req.user, expense.amount);
    }
    await expense.update({ is_active: false });
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

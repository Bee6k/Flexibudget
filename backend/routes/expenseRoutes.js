const express = require('express');
const { body, param, query } = require('express-validator');
const {
  listExpenses,
  createExpense,
  bulkCreateExpenses,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const expenseBodyRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero.'),
  body('frequency')
    .isIn(['weekly', 'monthly', 'yearly', 'one-time'])
    .withMessage('Invalid frequency.'),
  body('priority_tier').isInt({ min: 1, max: 4 }).withMessage('Priority tier must be between 1 and 4.'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('Invalid due date.'),
];

router.use(requireAuth);

router.get(
  '/',
  query('tier').optional().isInt({ min: 1, max: 4 }).withMessage('Invalid tier filter.'),
  validate,
  listExpenses
);
router.post('/', expenseBodyRules, validate, createExpense);
router.post(
  '/bulk',
  body('items').isArray({ min: 1, max: 50 }).withMessage('Provide 1–50 items.'),
  body('items.*.name').trim().notEmpty().withMessage('Each item needs a name.'),
  body('items.*.amount').isFloat({ min: 0.01 }).withMessage('Each item amount must be greater than zero.'),
  body('items.*.priority_tier').isInt({ min: 1, max: 4 }).withMessage('Each item needs a valid tier.'),
  body('items.*.frequency')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly', 'one-time'])
    .withMessage('Invalid frequency.'),
  body('items.*.due_date').optional({ nullable: true }).isISO8601().withMessage('Invalid due date.'),
  validate,
  bulkCreateExpenses
);
router.put(
  '/:expenseId',
  param('expenseId').isInt({ min: 1 }).withMessage('Invalid expense id.'),
  expenseBodyRules,
  validate,
  updateExpense
);
router.delete(
  '/:expenseId',
  param('expenseId').isInt({ min: 1 }).withMessage('Invalid expense id.'),
  validate,
  deleteExpense
);

module.exports = router;

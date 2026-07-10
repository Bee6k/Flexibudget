const express = require('express');
const { body, param } = require('express-validator');
const {
  listIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AMOUNT_MAX } = require('../utils/moneyLimits');

const router = express.Router();

const incomeBodyRules = [
  body('source_name').trim().isLength({ min: 1, max: 100 }).withMessage('Source name is required.'),
  body('amount').isFloat({ min: 0.01, max: AMOUNT_MAX }).withMessage('Amount must be between 0.01 and 99,999,999.99.'),
  body('expected_date').isISO8601().withMessage('Expected date is required.'),
  body('is_recurring').optional().isBoolean().toBoolean().withMessage('is_recurring must be boolean.'),
];

router.use(requireAuth);

router.get('/', listIncomes);
router.post('/', incomeBodyRules, validate, createIncome);
router.put(
  '/:incomeId',
  param('incomeId').isInt({ min: 1 }).withMessage('Invalid income id.'),
  incomeBodyRules,
  validate,
  updateIncome
);
router.delete(
  '/:incomeId',
  param('incomeId').isInt({ min: 1 }).withMessage('Invalid income id.'),
  validate,
  deleteIncome
);

module.exports = router;

const express = require('express');
const { body, param } = require('express-validator');
const {
  listInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investmentController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const INVESTMENT_TYPES = [
  'Mutual Funds', 'Stocks', 'Crypto', 'FDs', 'Gold', 'Real Estate', 'Other',
];

const router = express.Router();
const moneyMax = 1_000_000_000;

router.use(requireAuth);

router.get('/', listInvestments);
router.post(
  '/',
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('type').isIn(INVESTMENT_TYPES).withMessage('Invalid investment type.'),
  body('value').isFloat({ min: 0.01, max: moneyMax }).withMessage('Value must be greater than zero.'),
  body('change').optional().isFloat({ min: -1000, max: 1000 }).withMessage('Change must be a number.'),
  validate,
  createInvestment
);
router.put(
  '/:investmentId',
  param('investmentId').isInt({ min: 1 }).withMessage('Invalid investment id.'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('type').isIn(INVESTMENT_TYPES).withMessage('Invalid investment type.'),
  body('value').isFloat({ min: 0.01, max: moneyMax }).withMessage('Value must be greater than zero.'),
  body('change').optional().isFloat({ min: -1000, max: 1000 }).withMessage('Change must be a number.'),
  validate,
  updateInvestment
);
router.delete(
  '/:investmentId',
  param('investmentId').isInt({ min: 1 }).withMessage('Invalid investment id.'),
  validate,
  deleteInvestment
);

module.exports = router;

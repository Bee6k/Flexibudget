const express = require('express');
const { body } = require('express-validator');
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

router.use(requireAuth);

router.get('/', listInvestments);
router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('type').isIn(INVESTMENT_TYPES).withMessage('Invalid investment type.'),
  body('value').isFloat({ min: 0.01 }).withMessage('Value must be greater than zero.'),
  body('change').optional().isFloat().withMessage('Change must be a number.'),
  validate,
  createInvestment
);
router.put(
  '/:investmentId',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('type').isIn(INVESTMENT_TYPES).withMessage('Invalid investment type.'),
  body('value').isFloat({ min: 0.01 }).withMessage('Value must be greater than zero.'),
  body('change').optional().isFloat().withMessage('Change must be a number.'),
  validate,
  updateInvestment
);
router.delete('/:investmentId', deleteInvestment);

module.exports = router;

const express = require('express');
const { body, param } = require('express-validator');
const {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
const moneyMax = 1_000_000_000;

router.use(requireAuth);

router.get('/', listSubscriptions);
router.post(
  '/',
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('amount').isFloat({ min: 0.01, max: moneyMax }).withMessage('Amount must be greater than zero.'),
  body('due_day').isInt({ min: 1, max: 28 }).withMessage('Billing day must be between 1 and 28.'),
  validate,
  createSubscription
);
router.put(
  '/:subscriptionId',
  param('subscriptionId').isInt({ min: 1 }).withMessage('Invalid subscription id.'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('amount').isFloat({ min: 0.01, max: moneyMax }).withMessage('Amount must be greater than zero.'),
  body('due_day').isInt({ min: 1, max: 28 }).withMessage('Billing day must be between 1 and 28.'),
  body('active').optional().isBoolean(),
  validate,
  updateSubscription
);
router.delete(
  '/:subscriptionId',
  param('subscriptionId').isInt({ min: 1 }).withMessage('Invalid subscription id.'),
  validate,
  deleteSubscription
);

module.exports = router;

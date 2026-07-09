const express = require('express');
const { body } = require('express-validator');
const {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', listSubscriptions);
router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero.'),
  body('due_day').isInt({ min: 1, max: 28 }).withMessage('Billing day must be between 1 and 28.'),
  validate,
  createSubscription
);
router.put(
  '/:subscriptionId',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero.'),
  body('due_day').isInt({ min: 1, max: 28 }).withMessage('Billing day must be between 1 and 28.'),
  body('active').optional().isBoolean(),
  validate,
  updateSubscription
);
router.delete('/:subscriptionId', deleteSubscription);

module.exports = router;

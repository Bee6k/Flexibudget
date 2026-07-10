const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateBalance, completeOnboarding } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { BALANCE_MAX } = require('../utils/moneyLimits');

const router = express.Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.put(
  '/balance',
  body('current_balance').isFloat({ min: 0, max: BALANCE_MAX }).withMessage('Balance must be zero or greater.'),
  validate,
  updateBalance
);
router.put(
  '/onboarding',
  body('onboarding_completed').optional().isBoolean().toBoolean(),
  body('archetype')
    .optional()
    .isIn(['student', 'freelancer', 'family', 'businessman', 'worker'])
    .withMessage('Invalid archetype.'),
  validate,
  completeOnboarding
);

module.exports = router;

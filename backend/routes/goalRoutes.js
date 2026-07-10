const express = require('express');
const { body, param } = require('express-validator');
const { listGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

const moneyMax = 1_000_000_000;

router.get('/', listGoals);
router.post(
  '/',
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('target').isFloat({ min: 0.01, max: moneyMax }).withMessage('Target must be greater than zero.'),
  body('current').optional().isFloat({ min: 0, max: moneyMax }).withMessage('Current amount must be zero or greater.'),
  validate,
  createGoal
);
router.put(
  '/:goalId',
  param('goalId').isInt({ min: 1 }).withMessage('Invalid goal id.'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('target').isFloat({ min: 0.01, max: moneyMax }).withMessage('Target must be greater than zero.'),
  body('current').optional().isFloat({ min: 0, max: moneyMax }).withMessage('Current amount must be zero or greater.'),
  validate,
  updateGoal
);
router.delete(
  '/:goalId',
  param('goalId').isInt({ min: 1 }).withMessage('Invalid goal id.'),
  validate,
  deleteGoal
);

module.exports = router;

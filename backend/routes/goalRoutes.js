const express = require('express');
const { body } = require('express-validator');
const { listGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', listGoals);
router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('target').isFloat({ min: 0.01 }).withMessage('Target must be greater than zero.'),
  body('current').optional().isFloat({ min: 0 }).withMessage('Current amount must be zero or greater.'),
  validate,
  createGoal
);
router.put(
  '/:goalId',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('target').isFloat({ min: 0.01 }).withMessage('Target must be greater than zero.'),
  body('current').optional().isFloat({ min: 0 }).withMessage('Current amount must be zero or greater.'),
  validate,
  updateGoal
);
router.delete('/:goalId', deleteGoal);

module.exports = router;

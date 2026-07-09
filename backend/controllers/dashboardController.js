/**
 * FILE: controllers/dashboardController.js
 *
 * PURPOSE:
 * Aggregates financial dashboard payload — user profile + all three algorithms.
 *
 * RESPONSIBILITIES:
 * - Parallel fetch: allocation, horizon, expenses
 * - Derive crisis state from horizon
 * - Group expenses by tier for frontend charts
 *
 * USED BY:
 * GET /dashboard, GET /allocation, GET /horizon, GET /recommendations
 *
 * DEPENDENCIES:
 * allocationService, horizonService, crisisService, recommendationService
 */
const { Expense } = require('../models');
const serializeUser = require('../utils/serializeUser');
const { groupExpensesByTier } = require('../utils/serializeExpense');
const { calculateAllocation } = require('../services/allocationService');
const { simulateHorizon } = require('../services/horizonService');
const { evaluateCrisisState } = require('../services/crisisService');
const { generateRecommendations } = require('../services/recommendationService');

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const [allocation, horizon, expenses] = await Promise.all([
      calculateAllocation(userId),
      simulateHorizon(userId),
      Expense.findAll({
        where: { user_id: userId, is_active: true },
        order: [['priority_tier', 'ASC'], ['name', 'ASC']],
      }),
    ]);
    const crisis = evaluateCrisisState(horizon);
    const user = serializeUser(req.user);

    res.json({
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        current_balance: user.current_balance,
      },
      allocation,
      horizon,
      crisis,
      expenses_by_tier: groupExpensesByTier(expenses),
      last_updated: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

async function getAllocation(req, res, next) {
  try {
    res.json(await calculateAllocation(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function getHorizon(req, res, next) {
  try {
    res.json(await simulateHorizon(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function getRecommendations(req, res, next) {
  try {
    res.json(await generateRecommendations(req.user.id));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getAllocation,
  getHorizon,
  getRecommendations,
};

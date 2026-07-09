const express = require('express');
const { getRecommendations } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getRecommendations);

module.exports = router;

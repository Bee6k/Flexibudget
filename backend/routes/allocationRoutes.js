const express = require('express');
const { getAllocation } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getAllocation);

module.exports = router;

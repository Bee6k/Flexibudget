const express = require('express');
const { getPreset } = require('../controllers/presetController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:archetype', requireAuth, getPreset);

module.exports = router;

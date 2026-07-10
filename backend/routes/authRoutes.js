const express = require('express');
const { body } = require('express-validator');
const { register, login, verify, logout, csrf } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const registerRules = [
  body('name').trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (max 120 characters).'),
  body('email').trim().isEmail().isLength({ max: 255 }).withMessage('Enter a valid email address.'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8–128 characters.')
    .matches(/[A-Za-z]/)
    .withMessage('Password must include a letter.')
    .matches(/\d/)
    .withMessage('Password must include a number.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.get('/csrf', csrf);
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.get('/verify', requireAuth, verify);

module.exports = router;

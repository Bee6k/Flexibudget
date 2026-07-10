/**
 * FILE: controllers/authController.js
 *
 * Registration, login, logout, session verify, CSRF issuance.
 * Login uses constant-time bcrypt path; JWT includes token_version for revocation.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models');
const serializeUser = require('../utils/serializeUser');
const { syncOnboardingCompleted } = require('../utils/onboardingSync');
const { getJwtSecret, signOptions } = require('../config/jwt');
const { setAuthCookie, clearAuthCookie, readAuthToken } = require('../utils/authCookie');
const { issueCsrfToken } = require('../middleware/csrf');

const SALT_ROUNDS = 12;

/** Dummy hash so missing-user logins still pay bcrypt cost (timing equalization). */
const DUMMY_HASH = bcrypt.hashSync('timing-equalization-placeholder', SALT_ROUNDS);

function signToken(user) {
  return jwt.sign(
    { sub: user.id, tv: Number(user.token_version) || 0 },
    getJwtSecret(),
    signOptions
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      token_version: 0,
    });

    res.status(201).json({
      message: 'Registration successful.',
      user: serializeUser(user),
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await syncOnboardingCompleted(
      await User.findOne({ where: { email: email.toLowerCase().trim() } })
    );

    const hash = user?.password_hash || DUMMY_HASH;
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    const csrfToken = issueCsrfToken(res);

    res.json({ user: serializeUser(user), csrfToken });
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const user = await syncOnboardingCompleted(req.user);
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = readAuthToken(req);
    if (token) {
      try {
        const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
        const user = await User.findByPk(payload.sub);
        if (user) {
          await user.increment('token_version');
        }
      } catch {
        /* expired/invalid token — still clear cookie */
      }
    }
    clearAuthCookie(res);
    res.json({ message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
}

function csrf(req, res) {
  const csrfToken = issueCsrfToken(res);
  res.json({ csrfToken });
}

module.exports = { register, login, verify, logout, csrf };

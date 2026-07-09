/**
 * FILE: controllers/authController.js
 *
 * PURPOSE:
 * Handles user registration, login, logout, session verification, and CSRF issuance.
 *
 * RESPONSIBILITIES:
 * - Register: bcrypt hash, create User
 * - Login: verify password, sign JWT, set HttpOnly cookie
 * - Logout: clear auth cookie
 * - Verify: return serialized user from req.user (set by requireAuth)
 *
 * USED BY:
 * - routes/authRoutes.js
 * - LoginPage, RegisterPage, AuthContext (frontend)
 *
 * SECURITY NOTES:
 * - Passwords never logged or returned
 * - Generic 401 message on login failure (no email enumeration beyond 409 on register)
 */
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { User } = require('../models');
const serializeUser = require('../utils/serializeUser');
const { syncOnboardingCompleted } = require('../utils/onboardingSync');

const { getJwtSecret, signOptions } = require('../config/jwt');

const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');

const { issueCsrfToken } = require('../middleware/csrf');



const SALT_ROUNDS = 10;



function signToken(user) {

  return jwt.sign({ sub: user.id }, getJwtSecret(), signOptions);

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
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
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



function logout(req, res) {

  clearAuthCookie(res);

  res.json({ message: 'Logged out.' });

}



function csrf(req, res) {

  const csrfToken = issueCsrfToken(res);

  res.json({ csrfToken });

}



module.exports = { register, login, verify, logout, csrf };


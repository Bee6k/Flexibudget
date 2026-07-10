/**
 * FILE: middleware/csrf.js
 *
 * SECURITY CRITICAL — CSRF protection via double-submit cookie pattern.
 */
const crypto = require('crypto');
const { cookiesShouldBeSecure } = require('../utils/cookieSecure');

const CSRF_COOKIE = 'flexibudget_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfCookie(res, token) {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: cookiesShouldBeSecure(),
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

function issueCsrfToken(res) {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  return token;
}

function tokensEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function csrfProtection(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];
  if (!cookieToken || !headerToken || !tokensEqual(cookieToken, headerToken)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
  }
  return next();
}

module.exports = {
  issueCsrfToken,
  csrfProtection,
};

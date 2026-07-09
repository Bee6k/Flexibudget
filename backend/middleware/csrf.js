/**
 * FILE: middleware/csrf.js
 *
 * PURPOSE:
 * SECURITY CRITICAL — CSRF protection via double-submit cookie pattern.
 *
 * RESPONSIBILITIES:
 * - Issue CSRF tokens (GET /auth/csrf)
 * - Validate X-CSRF-Token header matches flexibudget_csrf cookie on POST/PUT/DELETE
 *
 * USED BY:
 * - server.js (global /api middleware)
 * - authController.csrf
 *
 * SECURITY NOTES:
 * - Skipped when NODE_ENV=test so Supertest can run without CSRF setup
 * - Must NOT be disabled in production
 *
 * WHY double-submit:
 * Auth cookie is HttpOnly; CSRF cookie is readable by frontend JS and sent in header.
 */
const crypto = require('crypto');

const CSRF_COOKIE = 'flexibudget_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfCookie(res, token) {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
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

function csrfProtection(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
  }
  return next();
}

module.exports = {
  issueCsrfToken,
  csrfProtection,
};

/**
 * FILE: middleware/rateLimit.js
 *
 * PURPOSE:
 * HTTP rate limiting to reduce brute-force and API abuse.
 *
 * RESPONSIBILITIES:
 * - authLimiter: 10 req / 15 min on login/register
 * - apiLimiter: 120 req / min on all /api routes
 *
 * SECURITY NOTES:
 * - Skipped when NODE_ENV=test to avoid flaky Jest runs
 *
 * MAINTAINER NOTES:
 * - Tightening limits may block legitimate onboarding bulk requests
 */
const rateLimit = require('express-rate-limit');

function skipInTest() {
  return process.env.NODE_ENV === 'test';
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { error: 'Too many attempts. Try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { error: 'Too many requests. Slow down and try again.' },
});

module.exports = { authLimiter, apiLimiter };

/**
 * FILE: middleware/rateLimit.js
 *
 * HTTP rate limiting to reduce brute-force and API abuse.
 * Validation is disabled in test — express-rate-limit v7+ otherwise
 * throws on Jest/Supertest (missing/odd req.ip), which breaks CI.
 */
const rateLimit = require('express-rate-limit');

function skipInTest() {
  return process.env.NODE_ENV === 'test';
}

const shared = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  // Required for Jest/Supertest; see express-rate-limit validation docs
  validate: process.env.NODE_ENV === 'test' ? false : undefined,
};

const authLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again later.' },
});

const apiLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many requests. Slow down and try again.' },
});

module.exports = { authLimiter, apiLimiter };

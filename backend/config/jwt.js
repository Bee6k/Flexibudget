/**
 * FILE: config/jwt.js
 *
 * PURPOSE:
 * SECURITY CRITICAL — JWT signing/verification configuration.
 *
 * RESPONSIBILITIES:
 * - Enforce HS256 algorithm only
 * - assertJwtSecret(): reject weak or short secrets at startup
 *
 * DEPENDENCIES:
 * - process.env.JWT_SECRET, JWT_EXPIRES_IN
 *
 * SECURITY NOTES:
 * - Weak secret blocklist prevents default .env.example values in production
 * - Minimum 32 character secret required
 */
const WEAK_SECRETS = new Set([
  'replace_with_a_long_random_string_min_32_chars',
  'changeme',
  'secret',
  'change_me',
]);

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

const signOptions = {
  algorithm: 'HS256',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

const verifyOptions = {
  algorithms: ['HS256'],
};

function assertJwtSecret() {
  const secret = getJwtSecret();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  if (WEAK_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET is using a placeholder value. Generate a strong random secret.');
  }
}

module.exports = {
  getJwtSecret,
  signOptions,
  verifyOptions,
  assertJwtSecret,
};

/**
 * FILE: config/jwt.js
 * JWT signing/verification — HS256 only, weak-secret rejection.
 */
const WEAK_SECRETS = new Set([
  'replace_with_a_long_random_string_min_32_chars',
  'changeme',
  'secret',
  'change_me',
]);

const WEAK_PREFIXES = ['dev_only', 'test_', 'changeme', 'replace_with'];

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
  const lower = secret.toLowerCase();
  if (WEAK_PREFIXES.some((p) => lower.startsWith(p) || lower.includes(p))) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET looks like a development placeholder. Use a strong random secret in production.');
    }
  }
}

module.exports = {
  getJwtSecret,
  signOptions,
  verifyOptions,
  assertJwtSecret,
};

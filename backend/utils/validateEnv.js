const { assertJwtSecret } = require('../config/jwt');

function validateEnv() {
  assertJwtSecret();

  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`${key} must be set.`);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CLIENT_ORIGIN) {
      throw new Error('CLIENT_ORIGIN must be set in production.');
    }
    if (process.env.CLIENT_ORIGIN.trim() === '*') {
      throw new Error('CLIENT_ORIGIN must not be * in production.');
    }
    if (!process.env.DB_PASSWORD) {
      throw new Error('DB_PASSWORD must be set in production.');
    }
  }
}

module.exports = validateEnv;

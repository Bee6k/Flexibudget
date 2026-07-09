const { assertJwtSecret } = require('../config/jwt');

function validateEnv() {
  assertJwtSecret();

  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
    throw new Error('CLIENT_ORIGIN must be set in production.');
  }
}

module.exports = validateEnv;

/**
 * Runs once before all test suites. Ensures models are registered and schema exists.
 * Uses sync({ force: true }) only against the test database name for a clean slate.
 */
require('dotenv').config();

process.env.NODE_ENV = 'test';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'flexibudget-test-jwt-secret-minimum-32-chars-long';
}

module.exports = async () => {
  const dbName = process.env.DB_NAME || '';
  const { sequelize, seedPresetCategories } = require('../models');

  console.log('[jest globalSetup]', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: dbName,
  });

  await sequelize.authenticate();

  // Never force-drop a non-test database if someone points tests at prod by mistake
  const safeToForce = /test/i.test(dbName) || process.env.JEST_FORCE_SYNC === '1';
  if (safeToForce) {
    await sequelize.sync({ force: true });
    console.log('[jest globalSetup] sync({ force: true }) ok');
  } else {
    await sequelize.sync();
    console.log('[jest globalSetup] sync() ok');
  }

  await seedPresetCategories();
  console.log('[jest globalSetup] preset categories seeded');
};

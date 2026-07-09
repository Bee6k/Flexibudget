/**
 * FILE: server.js
 *
 * PURPOSE:
 * Express application entry point — wires middleware, routes, and database bootstrap.
 *
 * RESPONSIBILITIES:
 * - Security middleware (helmet, CORS, cookies, CSRF, rate limits)
 * - Mount all /api route modules
 * - Global error handler (safe 5xx messages)
 * - Startup: validateEnv → sync → migrations → seed presets → listen
 *
 * USED BY:
 * - npm start / npm run server
 * - Jest/Supertest (exports `app` without calling listen when imported)
 *
 * DEPENDENCIES:
 * models, validateEnv, migrate, rateLimit, csrf, route modules
 *
 * SECURITY NOTES:
 * - CSRF enforced on mutating /api requests (skipped when NODE_ENV=test)
 * - CORS requires credentials + CLIENT_ORIGIN whitelist
 *
 * MAINTAINER NOTES:
 * - Middleware order matters; do not mount routes before cookieParser/CSRF without review
 * - See docs/ARCHITECTURE.md for request lifecycle
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { sequelize, seedPresetCategories } = require('./models');
const validateEnv = require('./utils/validateEnv');
const { runMigrations } = require('./utils/migrate');
const { authLimiter, apiLimiter } = require('./middleware/rateLimit');
const { csrfProtection } = require('./middleware/csrf');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);
app.use('/api', csrfProtection);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/allocation', require('./routes/allocationRoutes'));
app.use('/api/horizon', require('./routes/horizonRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/presets', require('./routes/presetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: 'Invalid data submitted.' });
  }
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    validateEnv();
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }
    await runMigrations(sequelize);
    await seedPresetCategories();
    console.log('Database models synchronized.');
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = app;

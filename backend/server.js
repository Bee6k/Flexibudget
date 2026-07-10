/**
 * FILE: server.js
 * Express entry — middleware, routes, DB bootstrap.
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

if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && allowedOrigins.some((o) => o === '*')) {
  throw new Error('CLIENT_ORIGIN must not be * when credentials are enabled.');
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
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

    // Schema is owned by migrations only. Do not call sequelize.sync() here —
    // sync previously created dozens of duplicate email indexes and extra FKs.
    await runMigrations(sequelize);
    await seedPresetCategories();
    console.log('Database migrations applied.');

    const server = app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

    const shutdown = async (signal) => {
      console.log(`${signal} received, shutting down…`);
      server.close(async () => {
        try {
          await sequelize.close();
        } finally {
          process.exit(0);
        }
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = app;

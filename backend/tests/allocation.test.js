require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../models');
const { calculateAllocation } = require('../services/allocationService');
const app = require('../server');

const email = `allocation-test-${Date.now()}@example.com`;
let token;
let userId;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  const user = await User.create({
    name: 'Allocation Tester',
    email,
    current_balance: 20000,
    password_hash: '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  });
  userId = user.id;
  token = jwt.sign(
    { sub: user.id, tv: Number(user.token_version) || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
});

afterAll(async () => {
  if (userId) {
    await User.destroy({ where: { id: userId } });
  }
});

describe('allocationService', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rent', amount: 15000, frequency: 'monthly', priority_tier: 1 });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Laptop', amount: 12000, frequency: 'one-time', priority_tier: 3 });
  });

  it('excludes one-time expenses from recurring monthly burn', async () => {
    const allocation = await calculateAllocation(userId);
    expect(allocation.total_expenses).toBe(15000);
    expect(allocation.tiers[0].total_cost).toBe(15000);
    expect(allocation.tiers[2].total_cost).toBe(0);
  });
});

describe('Preset API', () => {
  it('returns businessman presets', async () => {
    const res = await request(app)
      .get('/api/presets/businessman')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some((item) => item.name === 'Staff Payroll')).toBe(true);
  });

  it('returns worker presets', async () => {
    const res = await request(app)
      .get('/api/presets/worker')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.some((item) => item.name === 'Commute / Fuel')).toBe(true);
  });
});

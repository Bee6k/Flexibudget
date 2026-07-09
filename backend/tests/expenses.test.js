require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../models');
const app = require('../server');

const email = `expense-test-${Date.now()}@example.com`;
const password = 'password123';
let token;
let userId;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
});

afterAll(async () => {
  if (userId) {
    await User.destroy({ where: { id: userId } });
  }
  await sequelize.close();
});

describe('Expense API', () => {
  let expenseId;

  beforeAll(async () => {
    const user = await User.create({
      name: 'Expense Tester',
      email,
      password_hash: '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
    });
    userId = user.id;
    token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
  });

  it('creates an expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Rent',
        amount: 15000,
        frequency: 'monthly',
        priority_tier: 1,
      })
      .expect(201);

    expect(res.body.name).toBe('Rent');
    expect(res.body.expense_id).toBeDefined();
    expenseId = res.body.expense_id;
  });

  it('loads dashboard with expenses', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.expenses_by_tier[1].length).toBeGreaterThan(0);
    expect(res.body.allocation.tiers).toHaveLength(4);
    expect(res.body.horizon.daily_burn_rate).toBeGreaterThan(0);
  });

  it('updates an expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Rent Updated',
        amount: 16000,
        frequency: 'monthly',
        priority_tier: 1,
      })
      .expect(200);

    expect(res.body.name).toBe('Rent Updated');
  });

  it('soft deletes an expense', async () => {
    await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const list = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body).toHaveLength(0);
  });

  it('deducts one-time expenses from user balance', async () => {
    await User.update({ current_balance: 50000 }, { where: { id: userId } });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Accident repair',
        amount: 5000,
        frequency: 'one-time',
        priority_tier: 1,
        due_date: new Date().toISOString().slice(0, 10),
      })
      .expect(201);

    const dash = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Number(dash.body.user.current_balance)).toBe(45000);
  });
});

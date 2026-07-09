require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');
const app = require('../server');

const email = `income-test-${Date.now()}@example.com`;
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

describe('Income API', () => {
  let incomeId;

  beforeAll(async () => {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: 'Income Tester',
      email,
      password_hash,
    });
    userId = user.id;
    token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
  });

  it('creates an income', async () => {
    const res = await request(app)
      .post('/api/incomes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source_name: 'Salary',
        amount: 50000,
        expected_date: '2026-06-15',
        is_recurring: true,
      })
      .expect(201);

    expect(res.body.source_name).toBe('Salary');
    expect(res.body.income_id).toBeDefined();
    incomeId = res.body.income_id;
  });

  it('lists incomes', async () => {
    const res = await request(app)
      .get('/api/incomes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].source_name).toBe('Salary');
  });

  it('updates an income', async () => {
    const res = await request(app)
      .put(`/api/incomes/${incomeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        source_name: 'Freelance',
        amount: 55000,
        expected_date: '2026-06-20',
        is_recurring: false,
      })
      .expect(200);

    expect(res.body.source_name).toBe('Freelance');
    expect(res.body.amount).toBe(55000);
  });

  it('deletes an income', async () => {
    await request(app)
      .delete(`/api/incomes/${incomeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const list = await request(app)
      .get('/api/incomes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body).toHaveLength(0);
  });

  it('credits one-time income received today to balance', async () => {
    await User.update({ current_balance: 10000 }, { where: { id: userId } });
    const today = new Date().toISOString().slice(0, 10);

    await request(app)
      .post('/api/incomes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source_name: 'Side gig',
        amount: 3000,
        expected_date: today,
        is_recurring: false,
      })
      .expect(201);

    const dash = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Number(dash.body.user.current_balance)).toBe(13000);
  });

  it('rejects unauthenticated access', async () => {
    await request(app).get('/api/incomes').expect(401);
  });
});

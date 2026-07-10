require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../models');
const app = require('../server');

const email = `userdata-test-${Date.now()}@example.com`;
let token;
let userId;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  const user = await User.create({
    name: 'User Data Tester',
    email,
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

describe('Goals API', () => {
  let goalId;

  it('creates a goal', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Emergency Fund', target: 50000, current: 10000 })
      .expect(201);

    expect(res.body.name).toBe('Emergency Fund');
    expect(res.body.target).toBe(50000);
    goalId = res.body.id;
  });

  it('lists goals for the user', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('deletes a goal', async () => {
    await request(app)
      .delete(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});

describe('Subscriptions API', () => {
  let subscriptionId;

  it('creates a subscription', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Netflix', amount: 500, due_day: 15 })
      .expect(201);

    expect(res.body.name).toBe('Netflix');
    subscriptionId = res.body.id;
  });

  it('lists subscriptions for the user', async () => {
    const res = await request(app)
      .get('/api/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('deletes a subscription', async () => {
    await request(app)
      .delete(`/api/subscriptions/${subscriptionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});

describe('Investments API', () => {
  let investmentId;

  it('creates an investment', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nabil Fund', type: 'Mutual Funds', value: 25000, change: 4.5 })
      .expect(201);

    expect(res.body.name).toBe('Nabil Fund');
    investmentId = res.body.id;
  });

  it('lists investments for the user', async () => {
    const res = await request(app)
      .get('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('deletes an investment', async () => {
    await request(app)
      .delete(`/api/investments/${investmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});

require('dotenv').config();

const request = require('supertest');
const { sequelize } = require('../models');
const app = require('../server');

const email = `test-${Date.now()}@example.com`;
const password = 'password123';
const name = 'Test User';

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
});

afterAll(async () => {
  const { User } = require('../models');
  await User.destroy({ where: { email } });
  await sequelize.close();
});

describe('Auth API', () => {
  const agent = request.agent(app);

  it('registers a new user', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send({ name, email, password })
      .expect(201);

    expect(res.body.user.email).toBe(email);
    expect(res.body.user.name).toBe(name);
    expect(res.body.token).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await agent
      .post('/api/auth/register')
      .send({ name, email, password })
      .expect(409);
  });

  it('logs in and sets an auth cookie', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body.user.email).toBe(email);
    expect(res.headers['set-cookie']?.some((c) => c.startsWith('flexibudget_token='))).toBe(true);
  });

  it('verifies a valid session cookie', async () => {
    const res = await agent
      .get('/api/auth/verify')
      .expect(200);

    expect(res.body.user.email).toBe(email);
  });

  it('rejects missing auth on verify', async () => {
    await request(app).get('/api/auth/verify').expect(401);
  });

  it('logs out and clears the session', async () => {
    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/verify').expect(401);
  });
});

process.env.NODE_ENV = 'test';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'flexibudget-test-jwt-secret-minimum-32-chars-long';
}

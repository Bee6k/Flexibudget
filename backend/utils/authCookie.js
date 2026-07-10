/**
 * FILE: utils/authCookie.js
 *
 * SECURITY CRITICAL — HttpOnly JWT session cookie helpers.
 */
const { cookiesShouldBeSecure } = require('./cookieSecure');

const AUTH_COOKIE = 'flexibudget_token';

function parseMaxAge(expiresIn = '1h') {
  const match = String(expiresIn).match(/^(\d+)([smhd])$/i);
  if (!match) return 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * (multipliers[unit] || multipliers.h);
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: cookiesShouldBeSecure(),
    sameSite: 'strict',
    path: '/',
    maxAge: parseMaxAge(process.env.JWT_EXPIRES_IN || '1h'),
  };
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, cookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: cookiesShouldBeSecure(),
    sameSite: 'strict',
    path: '/',
  });
}

function readAuthToken(req) {
  if (req.cookies?.[AUTH_COOKIE]) return req.cookies[AUTH_COOKIE];
  if (process.env.NODE_ENV === 'test') {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
  }
  return null;
}

module.exports = {
  AUTH_COOKIE,
  setAuthCookie,
  clearAuthCookie,
  readAuthToken,
};

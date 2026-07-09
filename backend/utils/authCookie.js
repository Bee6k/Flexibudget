/**
 * FILE: utils/authCookie.js
 *
 * PURPOSE:
 * SECURITY CRITICAL — HttpOnly JWT session cookie helpers.
 *
 * RESPONSIBILITIES:
 * - setAuthCookie / clearAuthCookie on login/logout
 * - readAuthToken: cookie first, Bearer header fallback (tests)
 *
 * SECURITY NOTES:
 * - httpOnly: true prevents JavaScript token theft
 * - sameSite: 'strict' reduces CSRF (used with separate CSRF middleware)
 * - secure: true in production (requires HTTPS)
 */
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
    secure: process.env.NODE_ENV === 'production',
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
    secure: process.env.NODE_ENV === 'production',
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
  setAuthCookie,
  clearAuthCookie,
  readAuthToken,
};

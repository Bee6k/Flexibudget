/**
 * Whether auth/CSRF cookies should set the Secure flag.
 * Prefer explicit COOKIE_SECURE; fall back to NODE_ENV=production.
 */
function cookiesShouldBeSecure() {
  const explicit = process.env.COOKIE_SECURE;
  if (explicit === 'true' || explicit === '1') return true;
  if (explicit === 'false' || explicit === '0') return false;
  return process.env.NODE_ENV === 'production';
}

module.exports = { cookiesShouldBeSecure };

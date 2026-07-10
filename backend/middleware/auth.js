/**
 * FILE: middleware/auth.js
 * JWT authentication gate — verifies signature and token_version for revocation.
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getJwtSecret, verifyOptions } = require('../config/jwt');
const { readAuthToken } = require('../utils/authCookie');

async function requireAuth(req, res, next) {
  const token = readAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), verifyOptions);
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    const tokenVersion = Number(payload.tv) || 0;
    if (tokenVersion !== (Number(user.token_version) || 0)) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { requireAuth };

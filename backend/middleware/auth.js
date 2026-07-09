/**
 * FILE: middleware/auth.js
 *
 * PURPOSE:
 * SECURITY CRITICAL — JWT authentication gate for protected API routes.
 *
 * RESPONSIBILITIES:
 * - Extract JWT from HttpOnly cookie or Authorization Bearer header
 * - Verify signature (HS256) and load User into req.user
 *
 * USED BY:
 * - All protected route modules via requireAuth
 *
 * DEPENDENCIES:
 * - jsonwebtoken, User model, config/jwt.js, utils/authCookie.js
 *
 * SECURITY NOTES:
 * - Never attach user without successful jwt.verify
 * - Bearer fallback limited to NODE_ENV=test for automated tests
 *
 * RISKS IF MODIFIED:
 * Incorrect changes could allow unauthenticated access to all user financial data.
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

    req.user = user;

    next();

  } catch {

    return res.status(401).json({ error: 'Invalid or expired token.' });

  }

}



module.exports = { requireAuth };


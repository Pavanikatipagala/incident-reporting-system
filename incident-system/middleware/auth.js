/**
 * JWT authentication and role-based authorization.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Express middleware: attach req.user from JWT payload */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      const e = new Error('Access denied. No token provided.');
      e.statusCode = 401;
      throw e;
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      const e = new Error('User not found');
      e.statusCode = 401;
      throw e;
    }
    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      err.statusCode = 401;
      err.message = 'Invalid or expired token';
    }
    next(err);
  }
}

/** Only allow listed roles */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      const e = new Error('Not authenticated');
      e.statusCode = 401;
      return next(e);
    }
    if (!allowedRoles.includes(req.user.role)) {
      const e = new Error('Forbidden: insufficient permissions');
      e.statusCode = 403;
      return next(e);
    }
    next();
  };
}

module.exports = { authenticate, authorize };

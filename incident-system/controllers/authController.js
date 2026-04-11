/**
 * Registration (citizens only) and login (all roles).
 * Returns JWT for authenticated sessions.
 */
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const createError = require('../utils/httpError');

/** Build signed JWT */
function signToken(user) {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
  };
  if (user.department) {
    payload.departmentId = user.department.toString();
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** POST /api/auth/register — new citizen account */
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: 'citizen',
    });
    const token = signToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('department');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
          ? { id: user.department._id, name: user.department.name, code: user.department.code }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me — current user profile */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    if (!user) throw createError(404, 'User not found');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
          ? { id: user.department._id, name: user.department.name, code: user.department.code }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Session-based authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

// Attach user to res.locals for views
const attachUser = async (req, res, next) => {
  res.locals.user = null;
  res.locals.isAuthenticated = false;
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        res.locals.user = user;
        res.locals.isAuthenticated = true;
        req.user = user;
      }
    } catch (err) {
      console.error('Auth middleware error:', err.message);
    }
  }
  next();
};

// JWT token verification (API use)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = { isAuthenticated, attachUser, verifyToken };

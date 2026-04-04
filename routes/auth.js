const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login | DefenceTrack', error: null, success: null });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user || !user.isActive) {
      return res.render('auth/login', {
        title: 'Login | DefenceTrack',
        error: 'Invalid credentials or account inactive.',
        success: null,
      });
    }
    if (user.role !== role) {
      return res.render('auth/login', {
        title: 'Login | DefenceTrack',
        error: `Unauthorized role access for ${role.toUpperCase()}.`,
        success: null,
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditLog.log({ action: 'FAILED_LOGIN', performedBy: user._id, details: `Failed login for ${username}`, ipAddress: req.ip });
      return res.render('auth/login', {
        title: 'Login | DefenceTrack',
        error: 'Invalid credentials.',
        success: null,
      });
    }
    req.session.userId = user._id;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    await AuditLog.log({ action: 'LOGIN', performedBy: user._id, details: `${username} logged in`, ipAddress: req.ip });
    let redirectTo = req.session.returnTo || '/dashboard';
    if (!req.session.returnTo && user.role === 'technician') {
      redirectTo = '/technician/dashboard';
    }
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Login | DefenceTrack', error: 'Server error. Please try again.', success: null });
  }
});

// GET /auth/register
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Register | DefenceTrack', error: null, success: null });
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, username, email, badgeNumber, password, confirmPassword, role, rank, unit } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.render('auth/register', { title: 'Register | DefenceTrack', error: 'Passwords do not match.', success: null });
    }
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.render('auth/register', { title: 'Register | DefenceTrack', error: 'Username or email already exists.', success: null });
    }
    const newUser = new User({ name, username, email, badgeNumber, password, role: role || 'soldier', rank, unit });
    await newUser.save();
    await AuditLog.log({ action: 'CREATE_USER', performedBy: newUser._id, targetModel: 'User', targetId: newUser._id, details: `New user registered: ${username}` });
    res.render('auth/register', { title: 'Register | DefenceTrack', error: null, success: 'Account created! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.render('auth/register', { title: 'Register | DefenceTrack', error: err.message || 'Registration failed.', success: null });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const userId = req.session.userId;
  req.session.destroy(async (err) => {
    if (userId) {
      await AuditLog.log({ action: 'LOGOUT', performedBy: userId, details: 'User logged out' }).catch(() => {});
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;

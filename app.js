require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');
const { attachUser } = require('./middleware/auth');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override (for PUT/DELETE from forms)
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Attach user to all views
app.use(attachUser);

// Make flash-style messages available
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/assets', isAuthenticated, require('./routes/assets'));
app.use('/transactions', isAuthenticated, require('./routes/transactions'));
app.use('/audit', isAuthenticated, require('./routes/audit'));
app.use('/maintenance', isAuthenticated, require('./routes/maintenance'));
app.use('/technician', isAuthenticated, require('./routes/technician'));

// Dashboard route
app.get('/dashboard', isAuthenticated, async (req, res) => {
  const Asset = require('./models/Asset');
  const Transaction = require('./models/Transaction');
  const Maintenance = require('./models/Maintenance');
  const AuditLog = require('./models/AuditLog');
  try {
    const [totalAssets, availableAssets, inUseAssets, maintenanceAssets,
           recentTransactions, recentLogs, maintenanceDue, byCategory, checkoutAlerts] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'Available' }),
      Asset.countDocuments({ status: 'In Use' }),
      Asset.countDocuments({ status: 'Under Maintenance' }),
      Transaction.find().sort({ createdAt: -1 }).limit(5).populate('asset', 'name').populate('toUser', 'username'),
      AuditLog.find().sort({ timestamp: -1 }).limit(8).populate('performedBy', 'username'),
      Maintenance.countDocuments({ status: { $in: ['Scheduled', 'In Progress'] } }),
      Asset.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Asset.find({ checkoutLimitTriggered: true }).select('name serialNumber checkoutCount maxCheckout status').limit(10),
    ]);
    res.render('dashboard/index', {
      title: 'Dashboard | DefenceTrack',
      stats: { totalAssets, availableAssets, inUseAssets, maintenanceAssets, maintenanceDue },
      recentTransactions,
      recentLogs,
      byCategory,
      checkoutAlerts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Home redirect
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/auth/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 | DefenceTrack',
    message: 'Page not found.',
    user: res.locals.user,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error | DefenceTrack',
    message: 'An internal server error occurred.',
    user: res.locals.user,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 DefenceTrack running on http://localhost:${PORT}`);
});

module.exports = app;

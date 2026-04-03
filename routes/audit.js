const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { requireRole } = require('../middleware/roles');

// GET /audit
router.get('/', requireRole('admin', 'officer'), async (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    let query = {};
    if (action) query.action = action;
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'username rank role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    const actions = [
      'CREATE_ASSET', 'UPDATE_ASSET', 'DELETE_ASSET',
      'ASSIGN_ASSET', 'RETURN_ASSET',
      'CREATE_TRANSACTION', 'UPDATE_TRANSACTION',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
      'CREATE_MAINTENANCE', 'UPDATE_MAINTENANCE', 'COMPLETE_MAINTENANCE',
    ];
    res.render('audit/index', { title: 'Audit Log | DefenceTrack', logs, filters: { action, limit }, actions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

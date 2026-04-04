const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { requireRole } = require('../middleware/roles');
const crypto = require('crypto');

// GET /audit
router.get('/', requireRole('admin', 'officer'), async (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    let query = {};
    if (action) query.action = action;
    const allLogs = await AuditLog.find({}).lean();
    let globalTamperedCount = 0;
    
    allLogs.forEach(log => {
      const dataToHash = 
        log.action + 
        (log.performedBy ? log.performedBy.toString() : 'NONE') + 
        (log.assetId ? log.assetId.toString() : 'NONE') + 
        (log.targetId ? log.targetId.toString() : 'NONE') +
        (log.targetModel || 'NONE') +
        (log.ipAddress || '0.0.0.0') +
        (log.details || '') + 
        log.timestamp.toISOString() + 
        log.previousHash;
      
      const expectedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
      if (log.currentHash !== expectedHash) {
          globalTamperedCount++;
      }
    });

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    logs.forEach(log => {
      const dataToHash = 
        log.action + 
        (log.performedBy ? log.performedBy.toString() : 'NONE') + 
        (log.assetId ? log.assetId.toString() : 'NONE') + 
        (log.targetId ? log.targetId.toString() : 'NONE') +
        (log.targetModel || 'NONE') +
        (log.ipAddress || '0.0.0.0') +
        (log.details || '') + 
        log.timestamp.toISOString() + 
        log.previousHash;
      
      const expectedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
      log.isTampered = log.currentHash !== expectedHash;
      if (log.isTampered) console.log("FOUND TAMPERED:", log._id);
    });

    await AuditLog.populate(logs, [
      { path: 'performedBy', select: 'username rank role' },
      { path: 'assetId', select: 'name assetId category' }
    ]);
    
    // Completely recreate the objects to prevent ANY Mongoose getters/stripping in EJS
    const finalLogs = logs.map(l => ({
      ...l,
      performedBy: l.performedBy,
      assetId: l.assetId,
      isTampered: l.isTampered
    }));

    console.log('--- AUDIT GET --- Tampered Count:', finalLogs.filter(l => l.isTampered).length);
    const actions = [
      'CREATE_ASSET', 'UPDATE_ASSET', 'DELETE_ASSET',
      'ASSIGN_ASSET', 'RETURN_ASSET',
      'CREATE_TRANSACTION', 'UPDATE_TRANSACTION',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
      'CREATE_MAINTENANCE', 'UPDATE_MAINTENANCE', 'COMPLETE_MAINTENANCE',
    ];
    res.render('audit/index', { title: 'Audit Log | DefenceTrack', logs: finalLogs, globalTamperedCount, filters: { action, limit }, actions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

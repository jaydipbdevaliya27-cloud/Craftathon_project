const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Asset = require('../models/Asset');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { requireRole } = require('../middleware/roles');

// GET /transactions
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    const transactions = await Transaction.find(query)
      .populate('asset', 'name assetId')
      .populate('fromUser', 'username rank')
      .populate('toUser', 'username rank')
      .populate('authorizedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(100);
    res.render('transactions/index', {
      title: 'Transactions | DefenceTrack',
      transactions,
      filters: { type, status },
      types: ['Issue', 'Return', 'Transfer', 'Maintenance', 'Decommission'],
      statuses: ['Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /transactions/create
router.post('/create', requireRole('admin', 'officer'), async (req, res) => {
  try {
    const { type, assetId, toUserId, fromLocation, toLocation, purpose, notes } = req.body;
    const asset = await Asset.findById(assetId);
    if (!asset) return res.redirect('/transactions?error=Asset not found');
    const txn = new Transaction({
      type,
      asset: assetId,
      fromUser: req.user._id,
      toUser: toUserId || null,
      fromLocation: fromLocation || asset.location,
      toLocation: toLocation || '',
      purpose,
      notes,
      createdBy: req.user._id,
      authorizedBy: req.user._id,
      status: 'Approved',
    });
    await txn.save();
    // Update asset status
    if (type === 'Issue') {
      asset.status = 'In Use';
      asset.assignedTo = toUserId || null;
      if (toLocation) asset.location = toLocation;
    } else if (type === 'Return') {
      asset.status = 'Available';
      asset.assignedTo = null;
    } else if (type === 'Transfer') {
      if (toLocation) asset.location = toLocation;
      asset.assignedTo = toUserId || null;
    } else if (type === 'Decommission') {
      asset.status = 'Decommissioned';
    }
    await asset.save();
    await AuditLog.log({ action: 'CREATE_TRANSACTION', performedBy: req.user._id, targetModel: 'Transaction', targetId: txn._id, details: `${type} transaction for asset ${asset.name}`, ipAddress: req.ip });
    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.redirect('/transactions?error=' + err.message);
  }
});

module.exports = router;

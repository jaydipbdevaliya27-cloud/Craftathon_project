const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Maintenance = require('../models/Maintenance');
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
      .populate('asset', 'name assetId serialNumber')
      .populate('fromUser', 'username rank')
      .populate('toUser', 'username rank')
      .populate('authorizedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(100);
    res.render('transactions/index', {
      title: 'Transactions | DefenceTrack',
      transactions,
      filters: { type, status },
      error: req.query.error || null,
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
    const { 
      type, toUserId, badgeNumber, 
      fromLocation, toLocation, purpose, notes, 
      issueCondition, returnCondition, expectedReturnDate 
    } = req.body;

    // 1. Gather all serial numbers into an Array
    let serialList = [];
    if (req.body.serialNumbers) {
      serialList = Array.isArray(req.body.serialNumbers) ? req.body.serialNumbers : [req.body.serialNumbers];
    } else if (req.body.serialNumber) {
      // Legacy fallback
      serialList = Array.isArray(req.body.serialNumber) ? req.body.serialNumber : [req.body.serialNumber];
    }
    
    // Filter out empties
    serialList = serialList.map(s => s.trim()).filter(s => s !== '');

    if (serialList.length === 0) {
      return res.redirect('/transactions?error=' + encodeURIComponent('No weapon serial numbers provided.'));
    }

    // 2. Find the To User (by ID or Badge Number)
    let toUser = null;
    if (toUserId && toUserId.length === 24) {
      toUser = await User.findById(toUserId);
    }
    if (!toUser && badgeNumber) {
      toUser = await User.findOne({ badgeNumber: { $regex: new RegExp(`^${badgeNumber.trim()}$`, 'i') } });
    }

    if ((type === 'Issue' || type === 'checkout') && !toUser) {
      return res.redirect('/transactions?error=' + encodeURIComponent(`Soldier with Badge ID "${badgeNumber}" not found.`));
    }

    // 3. PRE-FLIGHT VALIDATION: Check ALL assets before processing any
    let assets = [];
    for (let s of serialList) {
      const asset = await Asset.findOne({ serialNumber: s });
      
      if (!asset) {
        return res.redirect('/transactions?error=' + encodeURIComponent(`Weapon "${s}" not found. Entire transaction blocked.`));
      }

      if (type === 'Issue' || type === 'checkout') {
        if (asset.status === 'In Use') {
          return res.redirect('/transactions?error=' + encodeURIComponent(`Weapon "${s}" is already issued. Entire transaction blocked.`));
        }
        if (asset.maxCheckout > 0 && asset.checkoutCount >= asset.maxCheckout) {
          return res.redirect('/transactions?error=' + encodeURIComponent(`🚫 CHECKOUT BLOCKED: "${asset.name}" (${s}) has reached its checkout limit and requires maintenance. Transaction aborted.`));
        }
      } else if (type === 'Return' || type === 'checkin') {
        if (asset.status === 'Available') {
          return res.redirect('/transactions?error=' + encodeURIComponent(`Weapon "${s}" is already checked in. Transaction aborted.`));
        }
      }
      
      assets.push(asset);
    }

    // 4. PROCESS TRANSACTION BATCH safely
    for (let asset of assets) {
      const txn = new Transaction({
        type,
        asset: asset._id,
        fromUser: req.user._id,
        toUser: toUser ? toUser._id : null,
        fromLocation: fromLocation || asset.location,
        toLocation: toLocation || '',
        purpose,
        notes: (notes ? notes + ' ' : '') + ((serialList.length > 1) ? '[Bulk Transaction]' : ''),
        issueCondition,
        returnCondition,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
        createdBy: req.user._id,
        authorizedBy: req.user._id,
        status: 'Approved',
      });

      await txn.save();

      // Update Asset State
      if (type === 'Issue' || type === 'checkout') {
        asset.status = 'In Use';
        asset.assignedTo = toUser ? toUser._id : null;
        asset.condition = issueCondition || asset.condition;
        if (toLocation) asset.location = toLocation;

        asset.checkoutCount = (asset.checkoutCount || 0) + 1;

        if (asset.maxCheckout > 0 && asset.checkoutCount >= asset.maxCheckout && !asset.checkoutLimitTriggered) {
          asset.checkoutLimitTriggered = true;
          const tech1 = await User.findOne({ username: 'tech1' });
          
          const limitMnt = new Maintenance({
            asset: asset._id,
            type: 'Routine',
            priority: 'High',
            status: 'Scheduled',
            description: `CHECKOUT LIMIT REACHED: Asset "${asset.name}" (Serial: ${asset.serialNumber}) reached its configured maximum of ${asset.maxCheckout}.`,
            scheduledDate: new Date(),
            assignedTechnician: tech1 ? tech1._id : null,
            requestedBy: req.user._id,
            notes: `Auto-triggered by checkout log. Transaction ID: ${txn.transactionId}`
          });
          await limitMnt.save();

          await AuditLog.log({
            action: 'CHECKOUT_LIMIT_TRIGGERED', performedBy: req.user._id, targetModel: 'Asset',
            targetId: asset._id, details: `Limit ${asset.maxCheckout} reached for ${asset.serialNumber}.`, ipAddress: req.ip
          });
        }
      } else if (type === 'Return' || type === 'checkin') {
        asset.status = 'Available';
        asset.assignedTo = null;
        asset.condition = returnCondition || asset.condition;
        if (toLocation) asset.location = toLocation;

        if (returnCondition === 'Poor') {
          asset.status = 'Under Maintenance';
          const tech1 = await User.findOne({ username: 'tech1' });
          const mnt = new Maintenance({
            asset: asset._id, type: 'Repair', priority: 'High', status: 'Scheduled',
            description: `Auto-triggered: Weapon returned in POOR condition.`,
            scheduledDate: new Date(), assignedTechnician: tech1 ? tech1._id : null,
            requestedBy: req.user._id, notes: `Check-in form.`
          });
          await mnt.save();
        }
      } else if (type === 'Transfer') {
        if (toLocation) asset.location = toLocation;
        asset.assignedTo = toUser ? toUser._id : null;
      } else if (type === 'Decommission' || type === 'decommission') {
        asset.status = 'Decommissioned';
      }

      await asset.save();

      await AuditLog.log({ 
        action: 'CREATE_TRANSACTION', performedBy: req.user._id, targetModel: 'Transaction', targetId: txn._id, assetId: asset._id,
        details: `${type} passed for ${asset.serialNumber}`, ipAddress: req.ip 
      });
    }

    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.redirect('/transactions?error=' + encodeURIComponent(err.message));
  }
});


module.exports = router;

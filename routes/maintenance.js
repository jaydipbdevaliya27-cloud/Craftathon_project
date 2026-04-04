const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { requireRole } = require('../middleware/roles');

// GET /maintenance
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    const records = await Maintenance.find(query)
      .populate('asset')
      .populate('requestedBy', 'username rank')
      .populate('assignedTechnician', 'username rank')
      .sort({ scheduledDate: 1 });
    const techniciansList = await User.find({ role: 'technician' }, 'name rank username');
    res.render('maintenance/index', {
      title: 'Maintenance | DefenceTrack',
      records,
      filters: { status, priority },
      statuses: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      priorities: ['Low', 'Medium', 'High', 'Critical'],
      techniciansList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /maintenance/create
router.post('/create', requireRole('admin', 'officer', 'technician'), async (req, res) => {
  try {
    const { assetId, type, priority, description, scheduledDate, technicianId, cost } = req.body;
    const record = new Maintenance({
      asset: assetId,
      type,
      priority: priority || 'Medium',
      description,
      scheduledDate: new Date(scheduledDate),
      assignedTechnician: technicianId || null,
      cost: parseFloat(cost) || 0,
      requestedBy: req.user._id,
    });
    await record.save();
    // Update asset status
    await Asset.findByIdAndUpdate(assetId, { status: 'Under Maintenance' });
    await AuditLog.log({ action: 'CREATE_MAINTENANCE', performedBy: req.user._id, targetModel: 'Maintenance', targetId: record._id, details: `Scheduled ${type} maintenance`, ipAddress: req.ip });
    res.redirect('/maintenance');
  } catch (err) {
    console.error(err);
    res.redirect('/maintenance?error=' + err.message);
  }
});

// POST /maintenance/:id/complete
router.post('/:id/complete', requireRole('admin', 'officer', 'technician'), async (req, res) => {
  try {
    const { notes, partsReplaced, cost } = req.body;
    const record = await Maintenance.findByIdAndUpdate(req.params.id, {
      status: 'Completed',
      completionDate: new Date(),
      notes,
      partsReplaced: partsReplaced ? partsReplaced.split(',').map(p => p.trim()) : [],
      cost: parseFloat(cost) || 0,
    }, { new: true });
    if (record) {
      await Asset.findByIdAndUpdate(record.asset, { status: 'Available', condition: 'Good' });
      await AuditLog.log({ action: 'COMPLETE_MAINTENANCE', performedBy: req.user._id, targetModel: 'Maintenance', targetId: record._id, details: 'Maintenance completed', ipAddress: req.ip });
    }
    res.redirect('/maintenance');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

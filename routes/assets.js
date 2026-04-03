const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const QRCode = require('qrcode');
const { requireRole } = require('../middleware/roles');

// GET /assets - List all assets
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const assets = await Asset.find(query).populate('assignedTo', 'username rank').sort({ createdAt: -1 });
    res.render('assets/index', {
      title: 'Assets | DefenceTrack',
      assets,
      filters: { status, category, search },
      statuses: ['Available', 'In Use', 'Under Maintenance', 'Decommissioned', 'Lost'],
      categories: ['Weapon', 'Vehicle', 'Communication', 'Medical', 'Ammunition', 'Electronics', 'Protective Gear', 'Other'],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /assets/add
router.get('/add', requireRole('admin', 'officer'), (req, res) => {
  res.render('assets/add', {
    title: 'Add Asset | DefenceTrack',
    error: null,
    categories: ['Weapon', 'Vehicle', 'Communication', 'Medical', 'Ammunition', 'Electronics', 'Protective Gear', 'Other'],
    conditions: ['Excellent', 'Good', 'Fair', 'Poor'],
  });
});

// POST /assets/add
router.post('/add', requireRole('admin', 'officer'), async (req, res) => {
  try {
    const { name, category, serialNumber, description, condition, location, unit, manufacturer, acquisitionCost, tags } = req.body;
    const asset = new Asset({
      name, category, serialNumber, description, condition,
      location, unit, manufacturer,
      acquisitionCost: parseFloat(acquisitionCost) || 0,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      createdBy: req.user._id,
    });
    // Generate QR code
    const qrData = JSON.stringify({ assetId: asset.assetId, name: asset.name, serialNumber: asset.serialNumber });
    asset.qrCode = await QRCode.toDataURL(qrData);
    await asset.save();
    await AuditLog.log({ action: 'CREATE_ASSET', performedBy: req.user._id, targetModel: 'Asset', targetId: asset._id, details: `Created asset: ${name}`, ipAddress: req.ip });
    res.redirect('/assets/' + asset._id);
  } catch (err) {
    console.error(err);
    res.render('assets/add', {
      title: 'Add Asset | DefenceTrack',
      error: err.message || 'Failed to add asset.',
      categories: ['Weapon', 'Vehicle', 'Communication', 'Medical', 'Ammunition', 'Electronics', 'Protective Gear', 'Other'],
      conditions: ['Excellent', 'Good', 'Fair', 'Poor'],
    });
  }
});

// GET /assets/:id
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('assignedTo', 'username rank unit').populate('createdBy', 'username');
    if (!asset) return res.status(404).render('error', { title: 'Not Found', message: 'Asset not found.', user: req.user });
    res.render('assets/detail', { title: asset.name + ' | DefenceTrack', asset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /assets/:id/update
router.post('/:id/update', requireRole('admin', 'officer', 'technician'), async (req, res) => {
  try {
    const { status, condition, location, notes } = req.body;
    const asset = await Asset.findByIdAndUpdate(req.params.id, { status, condition, location, notes, updatedAt: Date.now() }, { new: true });
    await AuditLog.log({ action: 'UPDATE_ASSET', performedBy: req.user._id, targetModel: 'Asset', targetId: asset._id, details: `Updated asset: ${asset.name}`, ipAddress: req.ip });
    res.redirect('/assets/' + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /assets/:id/delete
router.post('/:id/delete', requireRole('admin'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (asset) {
      await AuditLog.log({ action: 'DELETE_ASSET', performedBy: req.user._id, targetModel: 'Asset', targetId: asset._id, details: `Deleted asset: ${asset.name}`, ipAddress: req.ip });
    }
    res.redirect('/assets');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

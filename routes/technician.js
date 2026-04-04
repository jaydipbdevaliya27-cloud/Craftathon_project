const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { requireRole } = require('../middleware/roles');

// GET /technician/dashboard
router.get('/dashboard', requireRole('technician', 'admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingTasks, inProgressTasks, completedToday, completedAll, recentCompletions] = await Promise.all([
      Maintenance.find({ status: 'Scheduled', assignedTechnician: req.user._id }).populate('asset').populate('requestedBy', 'username rank'),
      Maintenance.find({ status: 'In Progress', assignedTechnician: req.user._id }).populate('asset').populate('requestedBy', 'username rank'),
      Maintenance.countDocuments({ assignedTechnician: req.user._id, status: 'Completed', completionDate: { $gte: today } }),
      Maintenance.countDocuments({ assignedTechnician: req.user._id, status: 'Completed' }),
      Maintenance.find({ assignedTechnician: req.user._id, status: 'Completed' }).sort({ completionDate: -1 }).limit(5).populate('asset'),
    ]);

    res.render('technician/dashboard', {
      title: 'Technician Dashboard | DefenceTrack',
      stats: {
        pending: pendingTasks.length,
        inProgress: inProgressTasks.length,
        completedToday,
        completedAll,
      },
      pendingTasks,
      inProgressTasks,
      recentCompletions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /technician/maintenance/:id/start
router.post('/maintenance/:id/start', requireRole('technician', 'admin'), async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndUpdate(req.params.id, {
      status: 'In Progress',
      assignedTechnician: req.user._id,
    }, { new: true });
    
    if (record) {
      await AuditLog.log({
        action: 'START_MAINTENANCE',
        performedBy: req.user._id,
        targetModel: 'Maintenance',
        targetId: record._id,
        details: `Started maintenance work on asset ${record.asset}`,
        ipAddress: req.ip,
      });
    }
    res.redirect('/technician/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/technician/dashboard?error=' + err.message);
  }
});

// GET /technician/history
router.get('/history', requireRole('technician', 'admin'), async (req, res) => {
  try {
    const history = await Maintenance.find({ 
      $or: [
        { assignedTechnician: req.user._id },
        { status: 'Completed' }
      ]
    })
    .populate('asset', 'name serialNumber assetId category model status condition location description')
    .populate('requestedBy', 'username rank')
    .populate('assignedTechnician', 'username rank')
    .sort({ completionDate: -1, createdAt: -1 });

    res.render('technician/history', {
      title: 'Maintenance History | DefenceTrack',
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

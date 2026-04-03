const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  completedDate: {
    type: Date,
    default: null,
  },
  type: {
    type: String,
    enum: ['Routine', 'Repair', 'Inspection'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed'],
    default: 'Scheduled',
  },
  technician: {
    type: String,
    required: [true, 'Technician name is required'],
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);

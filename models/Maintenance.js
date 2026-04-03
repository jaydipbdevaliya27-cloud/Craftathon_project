const mongoose = require('mongoose');
const crypto = require('crypto');

const maintenanceSchema = new mongoose.Schema({
  maintenanceId: {
    type: String,
    unique: true,
    default: () => 'MNT-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  type: {
    type: String,
    enum: ['Routine', 'Repair', 'Inspection', 'Overhaul', 'Emergency'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    default: null,
  },
  completionDate: {
    type: Date,
    default: null,
  },
  cost: {
    type: Number,
    default: 0,
  },
  partsReplaced: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

maintenanceSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);

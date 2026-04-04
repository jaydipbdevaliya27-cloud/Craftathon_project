const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  maintenanceId: {
    type: String,
    unique: true,
    default: () => `MNT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
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
  scheduledDate: {
    type: Date,
    required: true,
  },
  completionDate: {
    type: Date,
    default: null,
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  partsReplaced: [String],
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);

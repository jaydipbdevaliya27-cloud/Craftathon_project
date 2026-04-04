const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true,
    required: [true, 'Asset ID is required'],
    trim: true,
    default: () => `WPN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Weapon', 'Vehicle', 'Communication', 'Medical', 'Ammunition', 'Electronics', 'Protective Gear', 'Other'],
    required: true,
  },
  model: {
    type: String,
    trim: true,
    default: 'Standard',
  },
  serialNumber: {
    type: String,
    unique: true,
    required: [true, 'Serial number is required'],
    trim: true,
  },
  manufacturer: String,
  acquisitionCost: {
    type: Number,
    default: 0,
  },
  acquisitionDate: {
    type: Date,
    default: Date.now,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Under Maintenance', 'Decommissioned', 'Lost'],
    default: 'Available',
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  notes: String,
  tags: [String],
  qrCode: String,
  maxCheckout: {
    type: Number,
    default: 0,  // 0 means no limit set
    min: 0,
  },
  checkoutCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  checkoutLimitTriggered: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true, strictPopulate: false });

module.exports = mongoose.model('Asset', assetSchema);

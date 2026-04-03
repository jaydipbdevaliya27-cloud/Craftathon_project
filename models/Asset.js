const mongoose = require('mongoose');
const crypto = require('crypto');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true,
    default: () => 'ASSET-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
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
  serialNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
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
  location: {
    type: String,
    default: 'HQ',
    trim: true,
  },
  unit: {
    type: String,
    default: '',
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  acquisitionDate: {
    type: Date,
    default: Date.now,
  },
  acquisitionCost: {
    type: Number,
    default: 0,
  },
  manufacturer: {
    type: String,
    trim: true,
    default: '',
  },
  qrCode: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

assetSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Asset', assetSchema);

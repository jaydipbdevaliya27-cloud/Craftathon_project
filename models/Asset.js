const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true,
    required: [true, 'Asset ID is required'],
    trim: true,
    // Example: WPN-AK47-001-UNIT52
  },
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Firearm', 'Vehicle', 'Communication', 'Ammunition', 'Equipment'],
    required: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  serialNumber: {
    type: String,
    unique: true,
    required: [true, 'Serial number is required'],
    trim: true,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
  },
  currentHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Deployed', 'Maintenance', 'Lost'],
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
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Asset', assetSchema);

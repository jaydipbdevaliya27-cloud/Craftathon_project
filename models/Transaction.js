const mongoose = require('mongoose');
const crypto = require('crypto');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
  },
  type: {
    type: String,
    enum: ['Issue', 'Return', 'Transfer', 'Maintenance', 'Decommission'],
    required: [true, 'Transaction type is required'],
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  fromLocation: {
    type: String,
    trim: true,
    default: '',
  },
  toLocation: {
    type: String,
    trim: true,
    default: '',
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  purpose: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Pending',
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  completedDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);

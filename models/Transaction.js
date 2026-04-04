const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  type: {
    type: String,
    enum: ['Issue', 'Return', 'Transfer', 'Maintenance', 'Decommission', 'checkout', 'checkin', 'transfer'],
    required: true,
  },
  fromLocation: String,
  toLocation: String,
  location: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Approved',
  },
  purpose: String,
  missionCode: String,
  expectedReturnDate: Date,
  issueCondition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  returnCondition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  notes: String,
  remarks: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

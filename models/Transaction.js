const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['checkout', 'checkin', 'transfer'],
    required: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  missionCode: {
    type: String,
    trim: true,
    default: '',
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);

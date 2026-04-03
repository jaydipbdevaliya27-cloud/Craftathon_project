const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  previousHash: {
    type: String,
    default: '0',
  },
  currentHash: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// SHA-256 generation on save (Mongoose 9: async hooks resolve via returned promise, no next())
auditLogSchema.pre('save', async function () {
  const previousLog = await this.constructor.findOne().sort({ timestamp: -1 });
  this.previousHash = previousLog ? previousLog.currentHash : '0';

  const dataToHash = 
    this.action + 
    this.performedBy.toString() + 
    this.assetId.toString() + 
    this.details + 
    this.timestamp.toISOString() + 
    this.previousHash;

  this.currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
});

// Static method to get the last hash
auditLogSchema.statics.getLastHash = async function () {
  const lastLog = await this.findOne().sort({ timestamp: -1 });
  return lastLog ? lastLog.currentHash : '0';
};

module.exports = mongoose.model('AuditLog', auditLogSchema);

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
    required: false, // Changed to false for non-asset actions like LOGIN
  },
  details: {
    type: String,
    default: '',
  },
  targetModel: String,
  targetId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
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
}, { timestamps: true, strictPopulate: false });

// SHA-256 generation on save (Mongoose 9: async hooks resolve via returned promise, no next())
auditLogSchema.pre('save', async function () {
  const previousLog = await this.constructor.findOne().sort({ timestamp: -1 });
  this.previousHash = (previousLog && previousLog.currentHash) ? previousLog.currentHash : '0';

  const dataToHash = 
    this.action + 
    this.performedBy.toString() + 
    (this.assetId ? this.assetId.toString() : 'NONE') + 
    (this.targetId ? this.targetId.toString() : 'NONE') +
    (this.targetModel || 'NONE') +
    (this.ipAddress || '0.0.0.0') +
    this.details + 
    this.timestamp.toISOString() + 
    this.previousHash;

  this.currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
});

// Static method to log an action
auditLogSchema.statics.log = async function (data) {
  const { action, performedBy, targetModel, targetId, details, assetId, ipAddress } = data;
  return await this.create({
    action,
    performedBy,
    assetId: assetId || (targetModel === 'Asset' ? targetId : null),
    targetModel,
    targetId,
    details: details || `Performed ${action} on ${targetModel || 'system'}`,
    ipAddress,
  });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);

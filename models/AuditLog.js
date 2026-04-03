const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_ASSET', 'UPDATE_ASSET', 'DELETE_ASSET',
      'ASSIGN_ASSET', 'RETURN_ASSET',
      'CREATE_TRANSACTION', 'UPDATE_TRANSACTION',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
      'CREATE_MAINTENANCE', 'UPDATE_MAINTENANCE', 'COMPLETE_MAINTENANCE',
      'OTHER',
    ],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetModel: {
    type: String,
    enum: ['Asset', 'User', 'Transaction', 'Maintenance', 'System'],
    default: 'System',
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  details: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Static method for easy logging
auditLogSchema.statics.log = async function (data) {
  try {
    return await this.create(data);
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Maintenance = require('../models/Maintenance');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defencetrack';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Asset.deleteMany({}),
      Transaction.deleteMany({}),
      Maintenance.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.create([
      { name: 'John Doe', username: 'admin', badgeNumber: 'ADMIN-001', password: 'admin123', role: 'admin', unit: 'HQ Command', rank: 'Colonel', email: 'admin@military.gov' },
      { name: 'James Smith', username: 'officer1', badgeNumber: 'OFF-001', password: 'officer123', role: 'officer', unit: 'Alpha Company', rank: 'Captain', email: 'jsmith@military.gov' },
      { name: 'Robert Brown', username: 'sergeant_brown', badgeNumber: 'SOL-001', password: 'soldier123', role: 'soldier', unit: 'Maintenance Wing', rank: 'Sergeant', email: 'rbrown@military.gov' },
      { name: 'Alice Wilson', username: 'corporal_alice', badgeNumber: 'SOL-002', password: 'soldier456', role: 'soldier', unit: 'Bravo Company', rank: 'Corporal', email: 'awilson@military.gov' },
    ]);
    console.log(`👥 Created ${users.length} users`);

    // Create Assets
    const assetData = [
      { assetId: 'WPN-AK47-001-UNIT52', name: 'AK-47 Assault Rifle', category: 'Weapon', model: 'AK-47', serialNumber: 'SR-1001', unit: 'Alpha Company', location: 'Arms Room A', status: 'Available', condition: 'Excellent', description: 'Standard issue assault rifle', createdBy: users[0]._id, acquisitionCost: 45000 },
      { assetId: 'WPN-M4A1-001-UNIT52', name: 'M4A1 Carbine', category: 'Weapon', model: 'M4A1', serialNumber: 'SR-2001', unit: 'Alpha Company', location: 'Arms Room A', status: 'Available', condition: 'Excellent', description: 'Special Ops Carbine', createdBy: users[0]._id, acquisitionCost: 65000 },
      { assetId: 'WPN-SVD-001-UNIT52', name: 'SVD Sniper Rifle', category: 'Weapon', model: 'SVD', serialNumber: 'SR-3001', unit: 'Alpha Company', location: 'Arms Room B', status: 'Available', condition: 'Good', description: 'Designated marksman rifle', createdBy: users[0]._id, acquisitionCost: 85000 },
      { assetId: 'WPN-GLK-001-UNIT52', name: 'Glock 17 Sidearm', category: 'Weapon', model: 'Glock 17', serialNumber: 'SR-4001', unit: 'Alpha Company', location: 'Sidearm Rack', status: 'Available', condition: 'Excellent', description: 'Standard officer sidearm', createdBy: users[0]._id, acquisitionCost: 12000 },
      { assetId: 'WPN-AK12-001-UNIT52', name: 'AK-12 Assault Rifle', category: 'Weapon', model: 'AK-12', serialNumber: 'SR-5001', unit: 'Alpha Company', location: 'Arms Room A', status: 'In Use', condition: 'Good', description: 'Modern assault rifle', createdBy: users[0]._id, assignedTo: users[1]._id, acquisitionCost: 55000 },
      { assetId: 'VEH-HMMWV-001-UNIT52', name: 'Humvee', category: 'Vehicle', model: 'M1114', serialNumber: 'VH-2001', unit: 'HQ Command', location: 'Garage 1', status: 'Under Maintenance', condition: 'Fair', description: 'Armoured multi-purpose vehicle', createdBy: users[0]._id, acquisitionCost: 1500000 },
      { assetId: 'COM-RADIO-001-UNIT52', name: 'Tactical Radio', category: 'Communication', model: 'RF-7800', serialNumber: 'CM-3001', unit: 'Alpha Company', location: 'Comms Wing', status: 'Available', condition: 'Excellent', description: 'Handheld tactical radio', createdBy: users[0]._id, acquisitionCost: 120000 },
      { assetId: 'AMMO-556-001-UNIT52', name: '5.56mm Ammo Case', category: 'Ammunition', model: 'M855', serialNumber: 'AM-4001', unit: 'Alpha Company', location: 'Ammo Dump', status: 'Available', condition: 'Excellent', description: '5.56x45mm NATO ammunition case', createdBy: users[0]._id, acquisitionCost: 15000 },
    ];

    const assets = await Asset.create(assetData);
    console.log(`🔧 Created ${assets.length} assets`);

    // Create a Transaction
    await Transaction.create({
      asset: assets[1]._id,
      fromUser: users[0]._id,
      toUser: users[1]._id,
      type: 'checkout',
      location: 'Main Armoury',
      missionCode: 'OP-SHADOW',
      remarks: 'Standard deployment for routine patrol',
    });
    console.log('🔄 Created transactions');

    // Create a Maintenance record
    await Maintenance.create({
      asset: assets[2]._id,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      type: 'Repair',
      priority: 'High',
      status: 'Scheduled',
      description: 'Engine diagnostics and oil change',
      assignedTechnician: users[2]._id,
      requestedBy: users[0]._id,
      cost: 5000,
    });
    console.log('🛠️  Created maintenance records');

    // Create Audit Logs (will be auto-chained by pre-save hook)
    await AuditLog.create([
      { action: 'INITIAL_SEED', performedBy: users[0]._id, assetId: assets[0]._id, targetModel: 'System', details: 'System seeded with default data', ipAddress: '127.0.0.1' },
      { action: 'ASSET_REGISTRATION', performedBy: users[0]._id, assetId: assets[1]._id, targetModel: 'Asset', targetId: assets[1]._id, details: 'Manually registered AK-47', ipAddress: '127.0.0.1' },
    ]);
    console.log('📋 Created audit log entries (tamper-proof chain initialized)');

    console.log('\n✅ Seeding complete!');
    console.log('\n🔑 Login Credentials (use badgeNumber):');
    console.log('   ADMIN-001 / admin123 (Admin)');
    console.log('   OFF-001   / officer123 (Officer)');
    console.log('   SOL-001   / soldier123 (Soldier)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

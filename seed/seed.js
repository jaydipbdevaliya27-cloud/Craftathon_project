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
      { name: 'John Doe', badgeNumber: 'ADMIN-001', password: 'admin123', role: 'admin', unit: 'HQ Command', rank: 'Colonel' },
      { name: 'James Smith', badgeNumber: 'OFF-001', password: 'officer123', role: 'officer', unit: 'Alpha Company', rank: 'Captain' },
      { name: 'Robert Brown', badgeNumber: 'SOL-001', password: 'soldier123', role: 'soldier', unit: 'Maintenance Wing', rank: 'Sergeant' },
      { name: 'Alice Wilson', badgeNumber: 'SOL-002', password: 'soldier456', role: 'soldier', unit: 'Bravo Company', rank: 'Corporal' },
    ]);
    console.log(`👥 Created ${users.length} users`);

    // Create Assets
    const assetData = [
      { assetId: 'WPN-AK47-001-UNIT52', name: 'AK-47 Assault Rifle', type: 'Firearm', model: 'AK-47', serialNumber: 'SR-1001', unit: 'Alpha Company', location: 'Arms Room A', status: 'Available', condition: 'Excellent', description: 'Standard issue assault rifle', registeredBy: users[0]._id },
      { assetId: 'WPN-AK47-002-UNIT52', name: 'AK-47 Assault Rifle', type: 'Firearm', model: 'AK-47', serialNumber: 'SR-1002', unit: 'Alpha Company', location: 'Arms Room A', status: 'Deployed', condition: 'Good', description: 'Standard issue assault rifle', registeredBy: users[0]._id, currentHolder: users[1]._id },
      { assetId: 'VEH-HMMWV-001-UNIT52', name: 'Humvee', type: 'Vehicle', model: 'M1114', serialNumber: 'VH-2001', unit: 'HQ Command', location: 'Garage 1', status: 'Maintenance', condition: 'Fair', description: 'Armoured multi-purpose vehicle', registeredBy: users[0]._id },
      { assetId: 'COM-RADIO-001-UNIT52', name: 'Tactical Radio', type: 'Communication', model: 'RF-7800', serialNumber: 'CM-3001', unit: 'Alpha Company', location: 'Comms Wing', status: 'Available', condition: 'Excellent', description: 'Handheld tactical radio', registeredBy: users[0]._id },
      { assetId: 'AMMO-556-001-UNIT52', name: '5.56mm Ammo Case', type: 'Ammunition', model: 'M855', serialNumber: 'AM-4001', unit: 'Alpha Company', location: 'Ammo Dump', status: 'Available', condition: 'Excellent', description: '5.56x45mm NATO ammunition case', registeredBy: users[0]._id },
    ];

    const assets = await Asset.create(assetData);
    console.log(`🔧 Created ${assets.length} assets`);

    // Create a Transaction
    await Transaction.create({
      asset: assets[1]._id,
      fromUser: users[0]._id,
      toUser: users[1]._id,
      transactionType: 'checkout',
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
      status: 'Scheduled',
      technician: 'Sgt. Robert Brown',
      notes: 'Engine diagnostics and oil change',
      reportedBy: users[0]._id,
    });
    console.log('🛠️  Created maintenance records');

    // Create Audit Logs (will be auto-chained by pre-save hook)
    await AuditLog.create([
      { action: 'INITIAL_SEED', performedBy: users[0]._id, assetId: assets[0]._id, details: 'System seeded with default data' },
      { action: 'ASSET_REGISTRATION', performedBy: users[0]._id, assetId: assets[1]._id, details: 'Manually registered AK-47' },
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

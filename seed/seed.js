require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Maintenance = require('../models/Maintenance');
const AuditLog = require('../models/AuditLog');
const QRCode = require('qrcode');

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
      { username: 'admin', email: 'admin@defencetrack.mil', password: 'admin123', role: 'admin', rank: 'Colonel', unit: 'HQ Command' },
      { username: 'officer_james', email: 'james@defencetrack.mil', password: 'officer123', role: 'officer', rank: 'Captain', unit: 'Alpha Company' },
      { username: 'tech_patel', email: 'patel@defencetrack.mil', password: 'tech123', role: 'technician', rank: 'Sergeant', unit: 'Maintenance Wing' },
      { username: 'viewer_smith', email: 'smith@defencetrack.mil', password: 'viewer123', role: 'viewer', rank: 'Corporal', unit: 'Bravo Company' },
    ]);
    console.log(`👥 Created ${users.length} users`);

    // Create Assets
    const assetData = [
      { name: 'INSAS Rifle', category: 'Weapon', serialNumber: 'WPN-001', condition: 'Good', location: 'Arms Room A', unit: 'Alpha Company', manufacturer: 'OFB', acquisitionCost: 45000, tags: ['small-arms', 'tracked'] },
      { name: 'AK-47 Assault Rifle', category: 'Weapon', serialNumber: 'WPN-002', condition: 'Excellent', location: 'Arms Room A', unit: 'Alpha Company', manufacturer: 'Kalashnikov', acquisitionCost: 52000, tags: ['small-arms'] },
      { name: 'BRDM-2 Scout Vehicle', category: 'Vehicle', serialNumber: 'VEH-001', condition: 'Fair', location: 'Vehicle Bay', unit: 'HQ Command', manufacturer: 'GAZ', acquisitionCost: 1500000, tags: ['armoured', 'wheeled'] },
      { name: 'T-72 Main Battle Tank', category: 'Vehicle', serialNumber: 'VEH-002', condition: 'Good', location: 'Armour Depot', unit: 'Alpha Company', manufacturer: 'Uralvagonzavod', acquisitionCost: 25000000, tags: ['armoured', 'tracked', 'high-value'] },
      { name: 'Harris RF-7800H Radio', category: 'Communication', serialNumber: 'COM-001', condition: 'Excellent', location: 'Comms Room', unit: 'HQ Command', manufacturer: 'Harris Corp', acquisitionCost: 280000, tags: ['tactical-comms'] },
      { name: 'Medical Field Kit', category: 'Medical', serialNumber: 'MED-001', condition: 'Good', location: 'Medical Bay', unit: 'Bravo Company', manufacturer: 'Military Medics', acquisitionCost: 35000, tags: ['first-aid'] },
      { name: '9mm Ammunition Box', category: 'Ammunition', serialNumber: 'AMO-001', condition: 'Excellent', location: 'Ammo Depot', unit: 'Alpha Company', manufacturer: 'OFB', acquisitionCost: 18000, tags: ['ammunition', 'controlled'] },
      { name: 'Night Vision Goggles', category: 'Electronics', serialNumber: 'ELC-001', condition: 'Good', location: 'Equipment Store', unit: 'Alpha Company', manufacturer: 'Elbit Systems', acquisitionCost: 320000, tags: ['optics', 'night-ops'] },
      { name: 'Ballistic Vest Mk.IV', category: 'Protective Gear', serialNumber: 'PRO-001', condition: 'Good', location: 'Equipment Store', unit: 'Bravo Company', manufacturer: 'MKU Ltd', acquisitionCost: 55000, tags: ['protective'] },
      { name: 'Tactical Drone (UAV-X)', category: 'Electronics', serialNumber: 'ELC-002', condition: 'Excellent', location: 'Air Assets Bay', unit: 'HQ Command', manufacturer: 'DRDO', acquisitionCost: 850000, tags: ['surveillance', 'high-value'] },
    ];

    const assets = [];
    for (const data of assetData) {
      const asset = new Asset({ ...data, createdBy: users[0]._id });
      const qrData = JSON.stringify({ assetId: asset.assetId, name: asset.name, serialNumber: asset.serialNumber });
      asset.qrCode = await QRCode.toDataURL(qrData);
      await asset.save();
      assets.push(asset);
    }
    console.log(`🔧 Created ${assets.length} assets`);

    // Issue some assets
    assets[0].status = 'In Use';
    assets[0].assignedTo = users[1]._id;
    await assets[0].save();

    assets[2].status = 'Under Maintenance';
    await assets[2].save();

    // Create Transactions
    await Transaction.create([
      { type: 'Issue', asset: assets[0]._id, fromUser: users[0]._id, toUser: users[1]._id, fromLocation: 'Arms Room A', toLocation: 'Field', purpose: 'Training exercise', status: 'Completed', createdBy: users[0]._id, authorizedBy: users[0]._id },
      { type: 'Transfer', asset: assets[4]._id, fromUser: users[0]._id, toUser: users[1]._id, fromLocation: 'Comms Room', toLocation: 'Forward Base', purpose: 'Tactical deployment', status: 'Approved', createdBy: users[1]._id, authorizedBy: users[0]._id },
      { type: 'Maintenance', asset: assets[2]._id, fromUser: users[0]._id, fromLocation: 'Vehicle Bay', purpose: 'Scheduled service', status: 'Pending', createdBy: users[0]._id },
    ]);
    console.log('🔄 Created transactions');

    // Create Maintenance records
    await Maintenance.create([
      { asset: assets[2]._id, type: 'Repair', priority: 'High', status: 'In Progress', description: 'Engine overhaul required', requestedBy: users[1]._id, assignedTechnician: users[2]._id, scheduledDate: new Date(Date.now() + 86400000), startDate: new Date() },
      { asset: assets[7]._id, type: 'Routine', priority: 'Medium', status: 'Scheduled', description: 'Battery replacement and software update', requestedBy: users[0]._id, assignedTechnician: users[2]._id, scheduledDate: new Date(Date.now() + 7 * 86400000) },
      { asset: assets[4]._id, type: 'Inspection', priority: 'Low', status: 'Completed', description: 'Annual comms equipment inspection', requestedBy: users[0]._id, assignedTechnician: users[2]._id, scheduledDate: new Date(Date.now() - 5 * 86400000), completionDate: new Date() },
    ]);
    console.log('🛠️  Created maintenance records');

    // Create Audit Logs
    await AuditLog.create([
      { action: 'LOGIN', performedBy: users[0]._id, details: 'Admin logged in' },
      { action: 'CREATE_ASSET', performedBy: users[0]._id, targetModel: 'Asset', details: 'Bulk assets created during seeding' },
      { action: 'ASSIGN_ASSET', performedBy: users[0]._id, targetModel: 'Asset', targetId: assets[0]._id, details: `INSAS Rifle issued to ${users[1].username}` },
    ]);
    console.log('📋 Created audit log entries');

    console.log('\n✅ Seeding complete!');
    console.log('\n🔑 Login Credentials:');
    console.log('   admin      / admin123  (Admin)');
    console.log('   officer_james / officer123 (Officer)');
    console.log('   tech_patel / tech123   (Technician)');
    console.log('   viewer_smith / viewer123 (Viewer)');
    console.log('\n🚀 Start app: node app.js');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

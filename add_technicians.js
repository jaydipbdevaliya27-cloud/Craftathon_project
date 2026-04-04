const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defencetrack';

const technicians = [
  {
    name: 'Sgt. John Mechanic',
    username: 'tech1',
    badgeNumber: 'TECH-001',
    password: 'password123',
    role: 'technician',
    unit: 'Maintenance Div 1',
    rank: 'Sergeant',
    email: 'tech1@military.gov'
  },
  {
    name: 'Cpl. Sarah Repair',
    username: 'tech2',
    badgeNumber: 'TECH-002',
    password: 'password123',
    role: 'technician',
    unit: 'Repair Squad A',
    rank: 'Corporal',
    email: 'tech2@military.gov'
  },
  {
    name: 'WO Mark Technical',
    username: 'tech3',
    badgeNumber: 'TECH-003',
    password: 'password123',
    role: 'technician',
    unit: 'High-Tech Systems',
    rank: 'Warrant Officer',
    email: 'tech3@military.gov'
  }
];

async function addTechnicians() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const tech of technicians) {
      const existing = await User.findOne({ username: tech.username });
      if (existing) {
        console.log(`ℹ️  User ${tech.username} already exists.`);
        continue;
      }
      const newUser = new User(tech);
      await newUser.save();
      console.log(`👤 User created: ${tech.username}`);
    }

    console.log('\n--- Technician Credentials ---');
    technicians.forEach(t => {
      console.log(`Username: ${t.username} | Password: ${t.password} | Role: ${t.role}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating users:', err);
    process.exit(1);
  }
}

addTechnicians();

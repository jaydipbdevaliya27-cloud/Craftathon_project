const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defencetrack';

async function addUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const newUser = new User({
      name: 'Test Administrator',
      username: 'test',
      badgeNumber: 'TEST-001',
      password: 'testpassword',
      role: 'admin',
      unit: 'HQ Command',
      rank: 'Major',
      email: 'test@military.gov'
    });

    await newUser.save();
    console.log('👤 User created successfully!');
    console.log('   Username: test');
    console.log('   Password: testpassword');
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.log('ℹ️  User already exists.');
    } else {
      console.error('❌ Error creating user:', err);
    }
    process.exit(1);
  }
}

addUser();

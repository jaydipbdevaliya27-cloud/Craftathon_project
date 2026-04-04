const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Asset = require('./models/Asset');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userCount = await User.countDocuments();
    const assetCount = await Asset.countDocuments();
    const txnCount = await Transaction.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Assets: ${assetCount}`);
    console.log(`Transactions: ${txnCount}`);

    const lastTxn = await Transaction.findOne().populate('asset').populate('toUser');
    if (lastTxn) {
      console.log('Last Transaction Details:');
      console.log(`- ID: ${lastTxn.transactionId}`);
      console.log(`- Type: ${lastTxn.type}`); // This should NOT be undefined
      console.log(`- Asset: ${lastTxn.asset ? lastTxn.asset.name : 'N/A'}`);
      console.log(`- To User: ${lastTxn.toUser ? lastTxn.toUser.username : 'N/A'}`);
    } else {
      console.log('❌ No transactions found!');
    }

    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.username}`);
    } else {
      console.log('❌ Admin user NOT found!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Verification error:', err);
    process.exit(1);
  }
}

verify();

const mongoose = require('mongoose');
const Maintenance = require('./models/Maintenance');
require('./models/Asset');
require('./models/User');

mongoose.connect('mongodb://localhost:27017/defencetrack').then(async () => {
    const records = await Maintenance.find({}).populate('asset').populate('requestedBy').sort({ scheduledDate: 1 });
    const str = JSON.stringify(records);
    const parsed = JSON.parse(str);
    console.log("Is asset populated in JSON?", typeof parsed[0].asset === 'object' && parsed[0].asset !== null ? "YES: " + parsed[0].asset.name : "NO: " + parsed[0].asset);
    process.exit();
}).catch(console.error);

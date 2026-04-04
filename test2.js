const mongoose = require('mongoose');
const fs = require('fs');
const Maintenance = require('./models/Maintenance');
require('./models/Asset');
require('./models/User');

mongoose.connect('mongodb://localhost:27017/defencetrack').then(async () => {
    const records = await Maintenance.find({}).populate('asset').populate('requestedBy', 'username rank').populate('assignedTechnician', 'username rank').sort({ scheduledDate: 1 });
    fs.writeFileSync('maint_out.json', JSON.stringify(records[0], null, 2), 'utf8');
    process.exit();
}).catch(console.error);

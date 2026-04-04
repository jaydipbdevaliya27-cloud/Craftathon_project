const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect('mongodb://localhost:27017/defencetrack').then(async () => {
    const Maintenance = require('./models/Maintenance');
    require('./models/Asset'); require('./models/User');
    const records = await Maintenance.find()
      .populate('asset')
      .populate('requestedBy', 'username rank')
      .populate('assignedTechnician', 'username rank')
      .limit(1);
    fs.writeFileSync('C:/Users/Umesh/Desktop/new/maint_out_2.json', JSON.stringify(records, null, 2));
    process.exit();
});

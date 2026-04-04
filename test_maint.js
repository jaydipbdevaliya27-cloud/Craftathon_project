const mongoose = require('mongoose');
const Maintenance = require('./models/Maintenance');
require('./models/Asset');
require('./models/User');

mongoose.connect('mongodb://localhost:27017/defencetrack', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const records = await Maintenance.find({})
      .populate('asset')
      .populate('requestedBy', 'username rank')
      .populate('assignedTechnician', 'username rank')
      .sort({ scheduledDate: 1 });
    
    console.log(JSON.stringify(records, null, 2));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

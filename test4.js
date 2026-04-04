const ejs = require('ejs');
const fs = require('fs');
const mongoose = require('mongoose');
const Maintenance = require('./models/Maintenance');
require('./models/Asset');
require('./models/User');

mongoose.connect('mongodb://localhost:27017/defencetrack').then(async () => {
    const records = await Maintenance.find().populate('asset').populate('requestedBy').populate('assignedTechnician').limit(1);
    
    const template = fs.readFileSync('./views/maintenance/index.ejs', 'utf-8');
    
    // stub out the includes so ejs doesn't fail
    const stubTemplate = template.replace(/<%- include\(.*\) %>/g, '');
    
    try {
        const html = ejs.render(stubTemplate, {
            records: records,
            user: { role: 'admin' },
            statuses: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
            priorities: ['Low', 'Medium', 'High', 'Critical'],
            filters: {},
            techniciansList: []
        });
        
        fs.writeFileSync('rendered.html', html);
        console.log("Render successful");
    } catch (e) {
        console.error("EJS Render error:", e);
    }
    
    process.exit(0);
}).catch(console.error);

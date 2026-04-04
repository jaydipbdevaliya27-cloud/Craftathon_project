const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('rendered.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Find the ID of the first record
const records = window.records;
if (!records || records.length === 0) {
    console.error("No records found in window");
    process.exit(1);
}

const id = records[0]._id;
console.log("Found ID:", id);

// call openView
try {
    window.openView(id);
    console.log("openView succeeded!");
    
    // Read out some values
    const checkNames = ['v-asset-name', 'v-asset-id', 'v-mnt-type', 'v-mnt-sched', 'v-mnt-cost', 'v-mnt-desc', 'v-mnt-notes', 'v-mnt-comp', 'v-mnt-status'];
    checkNames.forEach(name => {
        const el = window.document.getElementById(name);
        if (el) {
            console.log(`${name}: ${el.textContent}`);
        } else {
            console.log(`ELEMENT NOT FOUND: ${name}`);
        }
    });

} catch (e) {
    console.error("Error executing openView:");
    console.error(e);
}

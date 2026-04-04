const fs = require('fs');

const html = fs.readFileSync('rendered.html', 'utf8');

const match = html.match(/const records = (\[.*?\]);/);
if (match) {
    const jsonStr = match[1];
    try {
        const records = JSON.parse(jsonStr);
        console.log("Records parsed successfully, count:", records.length);
        if (records.length > 0) {
            console.log("First record ID:", records[0]._id);
            console.log("Has asset?", !!records[0].asset);
            console.log("Has type?", records[0].type);
        }
    } catch(e) {
        console.log("FAILED TO PARSE RECORDS JSON:", e.message);
    }
} else {
    console.log("Could not find const records = [...] in HTML");
}

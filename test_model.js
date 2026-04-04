const mongoose = require('mongoose');
const Asset = require('./models/Asset');

console.log('--- Asset Schema Paths ---');
console.log(Object.keys(Asset.schema.paths));
if (Asset.schema.paths.assignedTo) {
  console.log('✅ assignedTo exists in schema');
} else {
  console.log('❌ assignedTo MISSING from schema');
}

process.exit(0);

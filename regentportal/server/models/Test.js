const mongoose = require('mongoose');

const options = { discriminatorKey: 'testType', collection: 'tests' };

const testSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now }
}, options);

module.exports = mongoose.model('Test', testSchema);
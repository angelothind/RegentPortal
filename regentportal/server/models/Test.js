const mongoose = require('mongoose');

const options = {
  discriminatorKey: 'testType',   // Allows specialization
  collection: 'tests'             // All discriminated models use the same collection
};

const testSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    unique: true
  },
  answers: {
    type: [String],
    default: [],
    required: true
  }
}, options);

module.exports = mongoose.model('Test', testSchema);
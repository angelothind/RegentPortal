const mongoose = require('mongoose');
const { Schema } = mongoose;

const options = {
  collection: 'tests'
};

const testSchema = new mongoose.Schema({
  uid: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  belongsTo: {
    type: String,
    required: true,
    default: 'Book 19'  // Default to Book 19 since that's what we have
  },
  sources: [
    {
      name: String,
      sourceType: String,       // e.g., "Paragraph A", "Audio 1"
      contentPath: String     // text of paragraph or audio file path
    }
  ],
  answers: {
    type: Map,
    of: Schema.Types.Mixed  // Can store arrays, strings, or mixed types
  }
}, options);

module.exports = mongoose.model('Test', testSchema);
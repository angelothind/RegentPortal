const mongoose = require('mongoose');

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
  type: {
    type: String,
    enum: ['listening', 'reading'],
    required: true
  },
  sources: [
    {
      name: String,       // e.g., "Paragraph A", "Audio 1"
      contentPath: String     // text of paragraph or audio file path
    }
  ],
  answers: [
    {
      questionNumber: Number,
      answer: String
    }
  ]
}, options);

module.exports = mongoose.model('Test', testSchema);

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  tests: [
    {
      testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
      },
      testName: {
        type: String,
        required: true
      }
    }
  ]
});

module.exports = mongoose.model('Book', bookSchema);
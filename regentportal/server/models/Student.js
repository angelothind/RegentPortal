const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  completedTests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    }
  ]
});

module.exports = mongoose.model('Student', studentSchema);
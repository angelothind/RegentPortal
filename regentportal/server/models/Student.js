const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if not modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Student', studentSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  givenAnswers: [
    {
      testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
      },
      answers: {
        type: [String], // array of answer strings
        required: true
      }
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

// Pre-remove middleware to delete all test submissions when a student is deleted
studentSchema.pre('findOneAndDelete', async function (next) {
  try {
    const TestSubmission = mongoose.model('TestSubmission');
    const filter = this.getFilter();
    const student = await this.model.findOne(filter);
    
    if (student) {
      await TestSubmission.deleteMany({ studentId: student._id });
      console.log(`🧹 Deleted all test submissions for student: ${student.username}`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-deleteOne middleware to handle single deletions
studentSchema.pre('deleteOne', async function (next) {
  try {
    const TestSubmission = mongoose.model('TestSubmission');
    const filter = this.getFilter();
    const student = await this.model.findOne(filter);
    
    if (student) {
      await TestSubmission.deleteMany({ studentId: student._id });
      console.log(`🧹 Deleted all test submissions for student: ${student.username}`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-deleteMany middleware to handle bulk deletions
studentSchema.pre('deleteMany', async function (next) {
  try {
    const TestSubmission = mongoose.model('TestSubmission');
    const filter = this.getFilter();
    const studentsToDelete = await this.model.find(filter);
    const studentIds = studentsToDelete.map(student => student._id);
    
    if (studentIds.length > 0) {
      await TestSubmission.deleteMany({ studentId: { $in: studentIds } });
      console.log(`🧹 Deleted all test submissions for ${studentIds.length} students`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Student', studentSchema);


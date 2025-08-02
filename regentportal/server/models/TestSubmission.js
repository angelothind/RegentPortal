const mongoose = require('mongoose');

const testSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  testType: {
    type: String,
    required: true,
    enum: ['listening', 'reading']
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  correctAnswers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  results: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctCount: {
    type: Number,
    required: true,
    min: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
testSubmissionSchema.index({ studentId: 1, testId: 1 });
testSubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('TestSubmission', testSubmissionSchema); 
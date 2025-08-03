const express = require('express');
const router = express.Router();
const TestSubmission = require('../models/TestSubmission');
const Student = require('../models/Student');

// Get all submissions for a specific test
router.get('/:testId', async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ 
      testId: req.params.testId 
    }).sort({ submittedAt: -1 }); // Sort by most recent first
    
    // Populate student information
    const submissionsWithStudentInfo = await Promise.all(
      submissions.map(async (submission) => {
        const student = await Student.findById(submission.studentId);
        return {
          _id: submission._id,
          testId: submission.testId,
          testType: submission.testType,
          score: submission.score,
          correctCount: submission.correctCount,
          totalQuestions: submission.totalQuestions,
          submittedAt: submission.submittedAt,
          studentName: student ? student.name : 'Unknown Student',
          studentId: submission.studentId,
          answers: submission.results ? Object.values(submission.results).map(result => ({
            studentAnswer: result.userAnswer || '',
            correctAnswer: result.correctAnswer || '',
            isCorrect: result.isCorrect || false
          })) : [],
          correctAnswers: submission.correctAnswers ? Object.fromEntries(submission.correctAnswers) : {},
          results: submission.results || {}
        };
      })
    );
    
    res.json({ submissions: submissionsWithStudentInfo });
  } catch (error) {
    console.error('Error fetching test submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
const mongoose = require('mongoose');
const TestSubmission = require('../models/TestSubmission');
const Student = require('../models/Student');
const gradingService = require('../services/gradingService');

// POST /api/submit/submit
const submitTest = async (req, res) => {
  try {
    const { testId, testType, answers, studentId } = req.body;

    if (!testId || !testType || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testId, testType, studentId'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studentId format. Please log in again.'
      });
    }

    const normalizedTestType = testType.toLowerCase();
    const correctAnswers = await gradingService.loadCorrectAnswers(testId, normalizedTestType);

    if (!correctAnswers || Object.keys(correctAnswers).length === 0) {
      console.error('No correct answers loaded');
      return res.status(500).json({
        success: false,
        message: 'Failed to load correct answers'
      });
    }

    const normalizedAnswers = gradingService.normalizeTableCompletionAnswers(answers);
    const { results, correctCount, totalQuestions, score } = gradingService.gradeAnswers(correctAnswers, normalizedAnswers);

    const testSubmission = new TestSubmission({
      studentId: studentId,
      testId: testId,
      testType: normalizedTestType,
      answers: normalizedAnswers,
      originalAnswers: answers,
      correctAnswers: correctAnswers,
      results: results,
      score: score,
      totalQuestions: totalQuestions,
      correctCount: correctCount,
      submittedAt: new Date()
    });

    try {
      await testSubmission.save();
    } catch (saveError) {
      console.error('Error saving test submission:', saveError);
      throw saveError;
    }

    res.json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        submissionId: testSubmission._id,
        score: score,
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        results: results,
        submittedAt: testSubmission.submittedAt
      }
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test',
      error: error.message
    });
  }
};

// Get a specific submission by ID with complete details (MUST come first)
const getSubmissionById = async (req, res) => {
  try {
    const submission = await TestSubmission.findById(req.params.submissionId)
      .populate('testId', 'title');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all submissions for a student
const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ studentId: req.params.studentId })
      .populate('testId', 'title')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error('Error fetching student submissions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get most recent submission for a specific student and test (MUST come before /:testId)
// Query parameter: testType (required) - 'reading' or 'listening'
const getLatestStudentTestSubmission = async (req, res) => {
  try {
    const { testType } = req.query;

    if (!testType) {
      return res.status(400).json({ error: 'testType query parameter is required' });
    }

    const normalizedTestType = testType.toLowerCase();
    if (!['reading', 'listening'].includes(normalizedTestType)) {
      return res.status(400).json({ error: 'testType must be "reading" or "listening"' });
    }

    const submission = await TestSubmission.findOne({
      studentId: req.params.studentId,
      testId: req.params.testId,
      testType: normalizedTestType
    })
      .sort({ submittedAt: -1 });

    if (!submission) {
      return res.status(404).json({ error: 'No submission found for this test and type' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Error fetching student test submission:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all submissions for a specific test (MUST come last) - TEACHERS ONLY
const getTestSubmissions = async (req, res) => {
  try {
    // TODO: Add authentication middleware to ensure only teachers can access this
    const submissions = await TestSubmission.find({
      testId: req.params.testId
    }).sort({ submittedAt: -1 });

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
};

module.exports = {
  submitTest,
  getSubmissionById,
  getStudentSubmissions,
  getLatestStudentTestSubmission,
  getTestSubmissions
};

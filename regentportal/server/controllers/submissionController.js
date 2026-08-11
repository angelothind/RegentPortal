const mongoose = require('mongoose');
const TestSubmission = require('../models/TestSubmission');
const Student = require('../models/Student');
const gradingService = require('../services/gradingService');

// Test endpoint to verify route is working
const healthCheck = (req, res) => {
  res.json({ message: 'Submit test route is working' });
};

// Test submission endpoint for debugging
const debugSubmission = (req, res) => {
  console.log('📝 Test submission received:', req.body);
  res.json({
    success: true,
    message: 'Test submission received',
    data: {
      score: 85,
      totalQuestions: 10,
      correctCount: 8,
      results: {
        1: { userAnswer: 'test', correctAnswer: 'test', isCorrect: true },
        2: { userAnswer: 'wrong', correctAnswer: 'right', isCorrect: false }
      },
      submittedAt: new Date()
    }
  });
};

// POST /api/submit/submit
const submitTest = async (req, res) => {
  try {
    console.log('📝 Received request body:', req.body);
    const { testId, testType, answers, studentId } = req.body;
    console.log('📝 Extracted studentId:', studentId, 'Type:', typeof studentId);

    console.log('📝 Received test submission:', {
      testId,
      testType,
      studentId,
      answerCount: Object.keys(answers).length
    });
    console.log('📝 TestId type:', typeof testId);
    console.log('📝 TestId value:', testId);

    // Validate required fields
    console.log('📝 Validating fields:', { testId, testType, studentId, hasAnswers: !!answers });
    if (!testId || !testType || !studentId) {
      console.log('❌ Missing required fields:', { testId, testType, studentId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testId, testType, studentId'
      });
    }

    // Validate that studentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.log('❌ Invalid studentId format:', studentId);
      return res.status(400).json({
        success: false,
        message: 'Invalid studentId format. Please log in again.'
      });
    }

    // Convert testType to lowercase to match model enum
    const normalizedTestType = testType.toLowerCase();
    console.log('📝 Normalized testType:', { original: testType, normalized: normalizedTestType });

    // Load correct answers from database (with JSON fallback)
    console.log('📝 Loading correct answers from database...');
    const correctAnswers = await gradingService.loadCorrectAnswers(testId, normalizedTestType);

    if (!correctAnswers || Object.keys(correctAnswers).length === 0) {
      console.error('❌ No correct answers loaded');
      return res.status(500).json({
        success: false,
        message: 'Failed to load correct answers'
      });
    }

    console.log('📝 Loaded correct answers:', correctAnswers);
    console.log('📝 Submitted answers:', answers);
    console.log('📝 Question numbers in submitted answers:', Object.keys(answers));
    console.log('📝 Question numbers in correct answers:', Object.keys(correctAnswers));

    // Debug: Show the structure of submitted answers
    Object.keys(answers).forEach(questionNumber => {
      console.log(`🔍 Submitted answer for question ${questionNumber}:`, {
        answer: answers[questionNumber],
        type: typeof answers[questionNumber],
        isArray: Array.isArray(answers[questionNumber]),
        length: Array.isArray(answers[questionNumber]) ? answers[questionNumber].length : 'N/A'
      });
    });

    // Debug: Show the structure of correct answers
    Object.keys(correctAnswers).forEach(questionNumber => {
      console.log(`🔍 Correct answer for question ${questionNumber}:`, {
        answer: correctAnswers[questionNumber],
        type: typeof correctAnswers[questionNumber],
        isArray: Array.isArray(correctAnswers[questionNumber]),
        length: Array.isArray(correctAnswers[questionNumber]) ? correctAnswers[questionNumber].length : 'N/A'
      });
    });

    const normalizedAnswers = gradingService.normalizeTableCompletionAnswers(answers);
    console.log('📝 Normalized answers for grading:', normalizedAnswers);

    // Calculate score and results - grade ALL questions individually
    const { results, correctCount, totalQuestions, score } = gradingService.gradeAnswers(correctAnswers, normalizedAnswers);

    // Create test submission record
    console.log('📝 Creating test submission with data:', {
      studentId,
      testId,
      testType,
      score,
      totalQuestions,
      correctCount
    });

    const testSubmission = new TestSubmission({
      studentId: studentId,
      testId: testId,
      testType: normalizedTestType,
      answers: normalizedAnswers, // Use normalized answers
      originalAnswers: answers, // Store original answers for reference
      correctAnswers: correctAnswers,
      results: results,
      score: score,
      totalQuestions: totalQuestions,
      correctCount: correctCount,
      submittedAt: new Date()
    });

    // Save to database
    try {
      await testSubmission.save();
      console.log('✅ Test submission saved successfully');
    } catch (saveError) {
      console.error('❌ Error saving test submission:', saveError);
      throw saveError;
    }

    console.log('✅ Test submission saved to database:', {
      submissionId: testSubmission._id,
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions
    });

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
    console.error('❌ Error submitting test:', error);
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
    console.error('❌ Error fetching submission:', err);
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
    console.error('❌ Error fetching student submissions:', err);
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
      .sort({ submittedAt: -1 }); // Get most recent submission

    if (!submission) {
      return res.status(404).json({ error: 'No submission found for this test and type' });
    }

    res.json(submission);
  } catch (err) {
    console.error('❌ Error fetching student test submission:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all submissions for a specific test (MUST come last) - TEACHERS ONLY
const getTestSubmissions = async (req, res) => {
  try {
    // TODO: Add authentication middleware to ensure only teachers can access this
    console.log('⚠️  WARNING: Submissions endpoint accessed without authentication check');
    console.log('📝 Request details:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      params: req.params
    });

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
};

module.exports = {
  healthCheck,
  debugSubmission,
  submitTest,
  getSubmissionById,
  getStudentSubmissions,
  getLatestStudentTestSubmission,
  getTestSubmissions
};

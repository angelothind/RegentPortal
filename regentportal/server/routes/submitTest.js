const express = require('express');
const router = express.Router();
const TestSubmission = require('../models/TestSubmission');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Submit test route is working' });
});

// Test submission endpoint for debugging
router.post('/test-submission', (req, res) => {
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
});

// POST /api/tests/submit
router.post('/submit', async (req, res) => {
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
    const mongoose = require('mongoose');
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

    // Define correct answers for this test (this should come from the database in a real app)
    const correctAnswers = {
      1: "90",
      2: "stream",
      3: "facts",
      4: "map",
      5: "attractions",
      6: "instruments",
      7: "freedom",
      8: "skills",
      9: "5",
      10: "teachers",
      11: "B",
      12: "A",
      13: "B",
      14: "C",
      15: "A",
      16: "D",
      17: "E",
      18: "F",
      19: "G",
      20: "A",
      21: ["B", "C"],
      22: ["B", "C"],
      23: ["B", "C"],
      24: ["B", "C"],
      25: "C",
      26: "D",
      27: "A",
      28: "B",
      29: "F",
      30: "H",
      31: "walls",
      32: "son",
      33: "fuel",
      34: "oxygen",
      35: "round",
      36: "cheese",
      37: "family",
      38: "winter",
      39: "soil",
      40: "rainfall"
    };

    // Calculate score and results
    let correctCount = 0;
    const totalQuestions = Object.keys(correctAnswers).length;
    const results = {};

    for (const questionNumber in correctAnswers) {
      const userAnswer = answers[questionNumber];
      const correctAnswer = correctAnswers[questionNumber];
      let isCorrect = false;

      // Handle different answer types
      if (Array.isArray(correctAnswer)) {
        // Multiple choice with multiple answers
        if (Array.isArray(userAnswer)) {
          isCorrect = userAnswer.length > 0 && 
                     userAnswer.length === correctAnswer.length &&
                     userAnswer.every(answer => correctAnswer.includes(answer));
        } else {
          isCorrect = false;
        }
      } else {
        // Single answer questions
        isCorrect = userAnswer && 
                   userAnswer.toString().trim() !== '' && 
                   userAnswer.toString().trim() === correctAnswer.toString().trim();
      }

      results[questionNumber] = {
        userAnswer: userAnswer || '',
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      };

      if (isCorrect) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

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
      answers: answers,
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
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const TestSubmission = require('../models/TestSubmission');
const Test = require('../models/Test');
const path = require('path');
const fs = require('fs');

// Function to load correct answers from database based on test type
const loadCorrectAnswers = async (testId, testType, submittedAnswers = {}) => {
  try {
    const test = await Test.findById(testId);
    console.log('📝 Found test:', test ? test.title : 'NOT FOUND');
    console.log('📝 Test ID being searched:', testId);
    if (!test) {
      throw new Error('Test not found');
    }

    const correctAnswers = {};
    
    // First, try to load answers from database (prioritize these)
    console.log(`📝 Loading correct answers from database for ${testType}...`);
    
    if (test.answers && test.answers.size > 0) {
      console.log('✅ Found answers in database');
      
      // Get answers for the specific test type
      const testTypeAnswers = test.answers.get(testType.toLowerCase());
      
      if (testTypeAnswers) {
        if (Array.isArray(testTypeAnswers)) {
          // Array format - convert to object with array indices as keys (matching Book 19 format)
          console.log(`📝 Found ${testTypeAnswers.length} ${testType} answers in database (array format)`);
          console.log(`📝 First few answers:`, testTypeAnswers.slice(0, 5));
          
          const dbAnswers = {};
          testTypeAnswers.forEach((answer, index) => {
            const questionNumber = (index + 1).toString();
            dbAnswers[questionNumber] = answer;
            console.log(`📝 Mapping index ${index} → question ${questionNumber}: ${answer}`);
          });
          
          console.log(`✅ Converted ${Object.keys(dbAnswers).length} answers from array format`);
          console.log(`📝 Sample mapped answers:`, {
            '1': dbAnswers['1'],
            '15': dbAnswers['15'],
            '16': dbAnswers['16'],
            '17': dbAnswers['17'],
            '18': dbAnswers['18'],
            '28': dbAnswers['28'],
            '31': dbAnswers['31']
          });
          return dbAnswers;
        } else if (typeof testTypeAnswers === 'object') {
          // Object format - already has array indices as keys (Book 19 format)
          console.log(`📝 Found ${Object.keys(testTypeAnswers).length} ${testType} answers in database (object format)`);
          return testTypeAnswers;
        }
      }
    }
    
    // No database answers found - throw error instead of falling back to JSON
    console.log(`❌ No database answers found for ${testType} test`);
    throw new Error(`No database answers found for ${testType} test. Database must contain all correct answers.`);
  } catch (error) {
    console.error('❌ Error loading correct answers:', error);
    throw error;
  }
};

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

    // Load correct answers from database (with JSON fallback)
    console.log('📝 Loading correct answers from database...');
    const correctAnswers = await loadCorrectAnswers(testId, normalizedTestType, answers);
    
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
    
    // Use answers directly - no normalization needed for our new approach
    const normalizedAnswers = { ...answers };
    console.log('📝 Using answers directly:', normalizedAnswers);

    // Calculate score and results - grade ALL questions individually
    let correctCount = 0;
    const allQuestions = Object.keys(correctAnswers);
    const totalQuestions = allQuestions.length;
    const results = {};

    console.log('📝 Grading ALL questions individually:', allQuestions);
    console.log('📝 User answers:', normalizedAnswers);

    // Grade each question individually
    for (const questionNumber of allQuestions) {
      const userAnswer = normalizedAnswers[questionNumber];
      const correctAnswer = correctAnswers[questionNumber];
      let isCorrect = false;

      // Handle different answer types
      if (Array.isArray(correctAnswer)) {
        console.log(`🔍 Multiple Choice 2 Question ${questionNumber}:`, {
          userAnswer,
          correctAnswer,
          userAnswerIsArray: Array.isArray(userAnswer),
          userAnswerType: typeof userAnswer
        });
        
        // Multiple choice with multiple answers (including MultipleChoiceTwo)
        if (Array.isArray(userAnswer) && userAnswer.length > 0) {
          // Count how many correct answers the user selected
          const correctSelections = userAnswer.filter(answer => correctAnswer.includes(answer)).length;
          const totalCorrect = correctAnswer.length;
          
          // Award marks based on correct selections
          if (correctSelections === totalCorrect) {
            // All correct answers selected - award full marks
            isCorrect = true;
            correctCount += totalCorrect; // Award marks for each correct answer
            console.log(`📝 Multiple choice question ${questionNumber}: ALL CORRECT! Awarding ${totalCorrect} marks. Total: ${correctCount}`);
          } else if (correctSelections > 0) {
            // Partial correct answers - award partial marks
            isCorrect = false; // Not fully correct
            correctCount += correctSelections; // Award marks for correct selections
            console.log(`📝 Multiple choice question ${questionNumber}: PARTIAL! Awarding ${correctSelections}/${totalCorrect} marks. Total: ${correctCount}`);
          } else {
            // No correct answers
            isCorrect = false;
            console.log(`📝 Multiple choice question ${questionNumber}: INCORRECT! No marks awarded. Total: ${correctCount}`);
          }
          
          console.log(`📝 Multiple choice question ${questionNumber} result:`, {
            userAnswer,
            correctAnswer,
            userAnswerLength: userAnswer.length,
            correctAnswerLength: correctAnswer.length,
            correctSelections,
            totalCorrect,
            isCorrect: isCorrect || correctSelections > 0 // Consider partially correct as "correct" for display
          });
        } else if (userAnswer && !Array.isArray(userAnswer)) {
          console.log(`🔍 Multiple Choice 2 Question ${questionNumber} - Single answer against array:`, {
            userAnswer,
            correctAnswer,
            userAnswerType: typeof userAnswer
          });
          
          // Single student answer against array correct answer (Multiple Choice 2)
          // Check if the single answer matches any of the correct options
          const normalizedUserAnswer = userAnswer.toString().trim();
          const isAnswerCorrect = correctAnswer.some(correctOption => 
            correctOption.toString().trim().toLowerCase() === normalizedUserAnswer.toLowerCase()
          );
          
          if (isAnswerCorrect) {
            isCorrect = true;
            correctCount += 1; // Award 1 mark for correct answer
            console.log(`📝 Multiple Choice 2 question ${questionNumber}: CORRECT! Student "${normalizedUserAnswer}" matches one of ${JSON.stringify(correctAnswer)}. Awarding 1 mark. Total: ${correctCount}`);
          } else {
            isCorrect = false;
            console.log(`📝 Multiple Choice 2 question ${questionNumber}: INCORRECT! Student "${normalizedUserAnswer}" does not match any of ${JSON.stringify(correctAnswer)}. No marks awarded. Total: ${correctCount}`);
          }
          
          console.log(`📝 Multiple Choice 2 question ${questionNumber} result:`, {
            userAnswer: normalizedUserAnswer,
            correctAnswer,
            isCorrect
          });
        } else {
          isCorrect = false;
          console.log(`📝 Multiple choice question ${questionNumber}: no valid user answer`);
        }
      } else {
        // Single answer questions (including Multiple Choice 2 individual questions)
        const normalizedUserAnswer = userAnswer ? userAnswer.toString().trim().toUpperCase() : '';
        const normalizedCorrectAnswer = correctAnswer ? correctAnswer.toString().trim().toUpperCase() : '';
        
        // Debug empty answers
        console.log(`🔍 Question ${questionNumber} answer analysis:`, {
          originalUserAnswer: userAnswer,
          normalizedUserAnswer,
          isEmpty: normalizedUserAnswer === '',
          correctAnswer: normalizedCorrectAnswer,
          willBeMarkedCorrect: normalizedUserAnswer !== '' && normalizedUserAnswer === normalizedCorrectAnswer
        });
        
        // Ensure empty/falsy answers are marked as incorrect
        const hasValidAnswer = normalizedUserAnswer && normalizedUserAnswer.trim() !== '';
        isCorrect = hasValidAnswer && normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (isCorrect) {
          correctCount += 1; // Award 1 mark for correct answer
          console.log(`📝 Single answer question ${questionNumber}: CORRECT! Awarding 1 mark. Total: ${correctCount}`);
        } else {
          console.log(`📝 Single answer question ${questionNumber}: INCORRECT! No marks awarded. Total: ${correctCount}`);
        }
        
        console.log(`📝 Single answer question ${questionNumber} result:`, {
          userAnswer: normalizedUserAnswer,
          correctAnswer: normalizedCorrectAnswer,
          hasValidAnswer,
          isCorrect
        });
      }

      results[questionNumber] = {
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      };

      console.log(`📝 Results for Q${questionNumber}:`, {
        userAnswer,
        correctAnswer,
        isCorrect,
        correctAnswerType: typeof correctAnswer,
        userAnswerType: typeof userAnswer
      });
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
});

module.exports = router;
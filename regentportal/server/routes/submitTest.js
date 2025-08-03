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
    
    // First, try to load answers from JSON files (prioritize these)
    console.log(`📝 Loading correct answers from JSON files for ${testType}...`);
    
    // Determine which parts to load based on submitted question numbers
    let partsToLoad = [];
    
    if (testType.toLowerCase() === 'reading') {
      // For reading tests, determine parts based on question numbers
      const questionNumbers = Object.keys(submittedAnswers).map(q => parseInt(q)).filter(q => !isNaN(q));
      
      if (questionNumbers.length > 0) {
        const maxQuestion = Math.max(...questionNumbers);
        if (maxQuestion <= 13) {
          partsToLoad = [1];
        } else if (maxQuestion <= 26) {
          partsToLoad = [1, 2];
        } else {
          partsToLoad = [1, 2, 3];
        }
      } else {
        // Fallback: load all parts if no questions submitted
        partsToLoad = [1, 2, 3];
      }
    } else {
      // For listening tests, load all parts
      partsToLoad = [1, 2, 3, 4];
    }
    
    console.log(`📝 Loading parts for ${testType} test:`, partsToLoad);
    
    for (const part of partsToLoad) {
      const testPath = test.title.replace(/\s+/g, ''); // "Test 1" -> "Test1"
      const questionFilePath = `assets/Books/Book19/${testPath}/questions/${testType.charAt(0).toUpperCase() + testType.slice(1)}/part${part}.json`;
      const absolutePath = path.join(__dirname, '..', questionFilePath);
      
      console.log(`🔍 Test title: "${test.title}"`);
      console.log(`🔍 Test path: "${testPath}"`);
      console.log(`🔍 Question file path: "${questionFilePath}"`);
      console.log(`🔍 Absolute path: "${absolutePath}"`);
      console.log(`🔍 File exists: ${fs.existsSync(absolutePath)}`);
      
      if (fs.existsSync(absolutePath)) {
        const rawContent = fs.readFileSync(absolutePath, 'utf-8');
        const questionData = JSON.parse(rawContent);
        
        // Extract correct answers from each template
        if (questionData.templates) {
          questionData.templates.forEach(template => {
            if (template.correctAnswers) {
              // Reading test format - has correctAnswers object
              Object.assign(correctAnswers, template.correctAnswers);
            } else if (template.questionBlock) {
              // Listening test format - has answer fields in questionBlock
              template.questionBlock.forEach(question => {
                if (question.questionNumber && question.answer) {
                  correctAnswers[question.questionNumber] = question.answer;
                }
              });
            }
          });
        }
      } else {
        console.warn(`⚠️ Question file not found: ${absolutePath}`);
      }
    }
    
    // If we found answers in JSON files, return them
    if (Object.keys(correctAnswers).length > 0) {
      console.log(`✅ Loaded ${Object.keys(correctAnswers).length} correct answers from JSON files`);
      return correctAnswers;
    }
    
    // Fallback to database answers if no JSON files found
    console.log(`📝 No JSON files found, checking database for ${testType} answers...`);
    if (test.answers && test.answers.size > 0) {
      console.log('✅ Found answers in database');
      
      // Get answers for the specific test type
      const testTypeAnswers = test.answers.get(testType.toLowerCase());
      if (testTypeAnswers && Array.isArray(testTypeAnswers)) {
        console.log(`📝 Found ${testTypeAnswers.length} ${testType} answers in database`);
        
        // Convert array to object with question numbers as keys
        const dbAnswers = {};
        testTypeAnswers.forEach((answer, index) => {
          dbAnswers[(index + 1).toString()] = answer;
        });
        
        console.log(`✅ Loaded ${Object.keys(dbAnswers).length} correct answers from database for ${testType}`);
        return dbAnswers;
      }
    }
    
    console.log(`❌ No correct answers found for ${testType} in JSON files or database`);
    return {};
    
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

    // Calculate score and results - grade ALL questions, not just submitted ones
    let correctCount = 0;
    const allQuestions = Object.keys(correctAnswers);
    const totalQuestions = allQuestions.length;
    const results = {};

    console.log('📝 Grading ALL questions:', allQuestions);
    console.log('📝 User answers:', answers);

    for (const questionNumber of allQuestions) {
      const userAnswer = answers[questionNumber] || ''; // Use empty string if no answer
      const correctAnswer = correctAnswers[questionNumber];
      let isCorrect = false;

      console.log(`📝 Grading question ${questionNumber}:`, { userAnswer, correctAnswer });

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
        const normalizedUserAnswer = userAnswer ? userAnswer.toString().trim().toUpperCase() : '';
        const normalizedCorrectAnswer = correctAnswer ? correctAnswer.toString().trim().toUpperCase() : '';
        
        isCorrect = normalizedUserAnswer !== '' && normalizedUserAnswer === normalizedCorrectAnswer;
        
        console.log(`📝 Comparing answers for question ${questionNumber}:`, {
          userAnswer: normalizedUserAnswer,
          correctAnswer: normalizedCorrectAnswer,
          isCorrect: isCorrect
        });
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
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
      const questionFilePath = `assets/Books/${test.belongsTo}/${testPath}/questions/${testType.charAt(0).toUpperCase() + testType.slice(1)}/part${part}.json`;
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
            } else if (template.questionGroup && template.questionType === 'multiple-choice-two') {
              // New MultipleChoiceTwo format with questionGroup
              const group = template.questionGroup;
              group.questionNumbers.forEach(questionNumber => {
                correctAnswers[questionNumber] = group.correctAnswers;
              });
              console.log(`📝 Loaded grouped answers for questions ${group.questionNumbers.join(', ')}:`, group.correctAnswers);
            } else if (template.questionType === 'table-completion' && template.tableData) {
              // Table completion format - has tableData with cells containing answers
              template.tableData.forEach(row => {
                row.cells.forEach(cell => {
                  if (cell.type === 'question' && cell.questionNumber && cell.answer) {
                    correctAnswers[cell.questionNumber] = cell.answer;
                    console.log(`📝 Loaded table completion answer for question ${cell.questionNumber}:`, cell.answer);
                  }
                });
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
      if (testTypeAnswers) {
        if (Array.isArray(testTypeAnswers)) {
          // Array format - convert to object with array indices as keys (matching Book 19 format)
          console.log(`📝 Found ${testTypeAnswers.length} ${testType} answers in database (array format)`);
          const dbAnswers = {};
          testTypeAnswers.forEach((answer, index) => {
            dbAnswers[index.toString()] = answer;
          });
          console.log(`✅ Converted ${Object.keys(dbAnswers).length} answers from array format`);
          return dbAnswers;
        } else if (typeof testTypeAnswers === 'object') {
          // Object format - already has array indices as keys (Book 19 format)
          console.log(`📝 Found ${Object.keys(testTypeAnswers).length} ${testType} answers in database (object format)`);
          console.log(`✅ Loaded ${Object.keys(testTypeAnswers).length} correct answers from database for ${testType}`);
          return testTypeAnswers;
        }
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
    
    // Debug: Show the structure of submitted answers
    Object.keys(answers).forEach(questionNumber => {
      console.log(`🔍 Submitted answer for question ${questionNumber}:`, {
        answer: answers[questionNumber],
        type: typeof answers[questionNumber],
        isArray: Array.isArray(answers[questionNumber]),
        length: Array.isArray(answers[questionNumber]) ? answers[questionNumber].length : 'N/A'
      });
    });
    
    // Fix: Ensure MultipleChoiceTwo answers are properly formatted as arrays
    const normalizedAnswers = { ...answers };
    Object.keys(normalizedAnswers).forEach(questionNumber => {
      const answer = normalizedAnswers[questionNumber];
      if (answer && typeof answer === 'string') {
        // Only try to parse as JSON if it looks like it might be a MultipleChoiceTwo answer
        // (contains brackets or looks like it was stringified)
        if (answer.startsWith('[') && answer.endsWith(']')) {
          try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) {
              normalizedAnswers[questionNumber] = parsed;
              console.log(`🔧 Fixed question ${questionNumber}: converted string "${answer}" to array:`, parsed);
            }
          } catch (e) {
            // If parsing fails, keep as string
            console.log(`🔧 Failed to parse "${answer}" as JSON, keeping as string`);
          }
        }
        // If it doesn't look like a JSON array, keep it as a string (don't convert to array)
      }
    });
    
    console.log('🔧 Normalized answers:', normalizedAnswers);

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

      console.log(`📝 Grading question ${questionNumber}:`, { userAnswer, correctAnswer });

      // Handle different answer types
      if (Array.isArray(correctAnswer)) {
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
        } else {
          isCorrect = false;
          console.log(`📝 Multiple choice question ${questionNumber}: no valid user answer`);
        }
      } else {
        // Single answer questions
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
        
        console.log(`📝 Single answer question ${questionNumber} result:`, {
          userAnswer: normalizedUserAnswer,
          correctAnswer: normalizedCorrectAnswer,
          hasValidAnswer,
          isCorrect: isCorrect
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

      if (isCorrect) {
        correctCount++;
        console.log(`📝 ✅ Question ${questionNumber} marked as CORRECT! Total correct: ${correctCount}`);
      } else {
        console.log(`📝 ❌ Question ${questionNumber} marked as INCORRECT! Total correct: ${correctCount}`);
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
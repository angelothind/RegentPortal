// server/scripts/testSubmissionLogic.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const testSubmissionLogic = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Test 1: Verify database answers are loaded correctly
    console.log('\n🔍 Test 1: Database Answer Loading');
    const test = await Test.findOne({ title: 'Test 1' });
    if (!test) {
      console.error('❌ Test 1 not found');
      return;
    }

    console.log('📝 Test found:', test.title);
    console.log('📝 Answers in database:', test.answers ? 'Yes' : 'No');
    
    if (test.answers && test.answers.size > 0) {
      const readingAnswers = test.answers.get('reading');
      const listeningAnswers = test.answers.get('listening');
      
      console.log(`📝 Reading answers: ${readingAnswers ? readingAnswers.length : 0} answers`);
      console.log(`📝 Listening answers: ${listeningAnswers ? listeningAnswers.length : 0} answers`);
      
      // Show some sample answers
      if (readingAnswers) {
        console.log('📝 Sample reading answers:');
        console.log('   Q1:', readingAnswers[0]);
        console.log('   Q8:', readingAnswers[7]);
        console.log('   Q20:', readingAnswers[19]); // Should be ["B", "D"]
        console.log('   Q37:', readingAnswers[36]);
      }
    }

    // Test 2: Simulate submission logic
    console.log('\n🔍 Test 2: Submission Logic Simulation');
    
    // Simulate student answers for reading test
    const mockStudentAnswers = {
      "1": "FALSE",
      "2": "FALSE", 
      "3": "NOT GIVEN",
      "8": "paint",
      "9": "topspin",
      "11": "intestines",
      "20": ["B", "D"],
      "37": "YES"
    };

    console.log('📝 Mock student answers:', mockStudentAnswers);

    // Load correct answers using the same logic as submitTest.js
    const loadCorrectAnswers = async (testId, testType, submittedAnswers = {}) => {
      try {
        const test = await Test.findById(testId);
        if (!test) {
          throw new Error('Test not found');
        }

        const correctAnswers = {};
        
        // Load answers from database based on test type
        console.log(`🔍 Checking for ${testType} answers in database...`);
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
        
        console.log(`📝 No ${testType} answers found in database`);
        return {};
        
      } catch (error) {
        console.error('❌ Error loading correct answers:', error);
        throw error;
      }
    };

    const correctAnswers = await loadCorrectAnswers(test._id, 'reading', mockStudentAnswers);
    console.log('📝 Loaded correct answers:', correctAnswers);

    // Test 3: Grading Logic
    console.log('\n🔍 Test 3: Grading Logic');
    
    let correctCount = 0;
    const submittedQuestions = Object.keys(mockStudentAnswers).filter(q => 
      mockStudentAnswers[q] !== '' && mockStudentAnswers[q] !== null && mockStudentAnswers[q] !== undefined
    );
    const totalQuestions = submittedQuestions.length;
    const results = {};

    console.log('📝 Grading submitted questions:', submittedQuestions);

    for (const questionNumber of submittedQuestions) {
      const userAnswer = mockStudentAnswers[questionNumber];
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

    console.log('\n📊 Grading Results:');
    console.log(`📝 Total questions submitted: ${totalQuestions}`);
    console.log(`📝 Correct answers: ${correctCount}`);
    console.log(`📝 Score: ${score}%`);
    console.log('📝 Detailed results:', results);

    // Test 4: Edge Cases
    console.log('\n🔍 Test 4: Edge Cases');
    
    // Test case sensitivity
    console.log('📝 Testing case sensitivity:');
    const caseTest = {
      userAnswer: "intestines",
      correctAnswer: "intestines / gut"
    };
    const normalizedUser = caseTest.userAnswer.toUpperCase();
    const normalizedCorrect = caseTest.correctAnswer.toUpperCase();
    console.log(`   User: "${caseTest.userAnswer}" -> "${normalizedUser}"`);
    console.log(`   Correct: "${caseTest.correctAnswer}" -> "${normalizedCorrect}"`);
    console.log(`   Match: ${normalizedUser === normalizedCorrect}`);

    // Test multiple choice arrays
    console.log('📝 Testing multiple choice arrays:');
    const arrayTest = {
      userAnswer: ["B", "D"],
      correctAnswer: ["B", "D"]
    };
    const arrayIsCorrect = arrayTest.userAnswer.length > 0 && 
                          arrayTest.userAnswer.length === arrayTest.correctAnswer.length &&
                          arrayTest.userAnswer.every(answer => arrayTest.correctAnswer.includes(answer));
    console.log(`   User: ${JSON.stringify(arrayTest.userAnswer)}`);
    console.log(`   Correct: ${JSON.stringify(arrayTest.correctAnswer)}`);
    console.log(`   Match: ${arrayIsCorrect}`);

    console.log('\n✅ All tests completed successfully!');

  } catch (err) {
    console.error('❌ Error testing submission logic:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

testSubmissionLogic(); 
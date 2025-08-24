require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

// Test an actual submission to verify marking works
const testActualSubmission = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Get Book 19 Test 1
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    if (!test1) {
      console.log('❌ Test 1 not found');
      return;
    }
    
    console.log('📝 Testing actual submission for Book 19 Test 1 Listening...');
    
    // Simulate student answers
    const studentAnswers = {
      '1': '69',                    // Optional answer - should be correct
      '2': 'stream',                // Single answer - should be correct
      '3': 'data',                  // Single answer - should be correct
      '4': 'wrong_answer',          // Single answer - should be incorrect
      '9': '4.95',                  // Single answer - should be correct
      '21': ['B', 'D'],             // Either-order - should be correct
      '22': ['D', 'B'],             // Either-order - should be correct (different order)
      '23': ['A', 'E'],             // Either-order - should be correct
      '24': ['E', 'A'],             // Either-order - should be correct (different order)
      '25': 'D',                    // Single answer - should be correct
      '30': 'wrong_letter',         // Single answer - should be incorrect
      '35': 'rectangular',          // Single answer - should be correct
      '40': 'rain'                  // Single answer - should be correct
    };
    
    // Get correct answers from database
    const correctAnswers = test1.answers.get('listening') || [];
    console.log('📊 Correct answers loaded:', correctAnswers.length);
    
    // Convert array format to object format (matching submitTest.js logic)
    const dbAnswers = {};
    correctAnswers.forEach((answer, index) => {
      dbAnswers[(index + 1).toString()] = answer;
    });
    
    console.log('📝 Student answers:', studentAnswers);
    console.log('📝 Correct answers (first 10):', Object.fromEntries(Object.entries(dbAnswers).slice(0, 10)));
    
    // Test marking logic for each question
    console.log('\n🧪 Testing Marking Logic for Each Question:');
    
    let correctCount = 0;
    const totalQuestions = Object.keys(studentAnswers).length;
    const results = {};
    
    for (const questionNumber of Object.keys(studentAnswers)) {
      const userAnswer = studentAnswers[questionNumber];
      const correctAnswer = dbAnswers[questionNumber];
      let isCorrect = false;
      
      console.log(`\n📝 Grading question ${questionNumber}:`, { userAnswer, correctAnswer });
      
      // Handle different answer types (same logic as submitTest.js)
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
        } else if (userAnswer && !Array.isArray(userAnswer)) {
          // Single student answer against array correct answer (optional answers)
          // Check if the single answer matches any of the correct options
          const normalizedUserAnswer = userAnswer.toString().trim();
          const isAnswerCorrect = correctAnswer.some(correctOption => 
            correctOption.toString().trim().toLowerCase() === normalizedUserAnswer.toLowerCase()
          );
          
          if (isAnswerCorrect) {
            isCorrect = true;
            correctCount += 1; // Award 1 mark for correct optional answer (regardless of how many options exist)
            console.log(`📝 Optional answer question ${questionNumber}: CORRECT! Student "${normalizedUserAnswer}" matches one of ${JSON.stringify(correctAnswer)}. Awarding 1 mark. Total: ${correctCount}`);
          } else {
            isCorrect = false;
            console.log(`📝 Optional answer question ${questionNumber}: INCORRECT! Student "${normalizedUserAnswer}" does not match any of ${JSON.stringify(correctAnswer)}. No marks awarded. Total: ${correctCount}`);
          }
        } else {
          isCorrect = false;
          console.log(`📝 Multiple choice question ${questionNumber}: no valid user answer`);
        }
      } else {
        // Single answer questions
        const normalizedUserAnswer = userAnswer ? userAnswer.toString().trim().toUpperCase() : '';
        const normalizedCorrectAnswer = correctAnswer ? correctAnswer.toString().trim().toUpperCase() : '';
        
        // Ensure empty/falsy answers are marked as incorrect
        const hasValidAnswer = normalizedUserAnswer && normalizedUserAnswer.trim() !== '';
        isCorrect = hasValidAnswer && normalizedUserAnswer === normalizedCorrectAnswer;
        
              if (isCorrect) {
        // Only increment for single answer questions - array questions already incremented above
        if (!Array.isArray(correctAnswer)) {
          correctCount += 1;
        }
      }
        
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
    }
    
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    console.log('\n📊 Final Results:');
    console.log(`- Total Questions: ${totalQuestions}`);
    console.log(`- Correct Count: ${correctCount}`);
    console.log(`- Score: ${score}%`);
    
    console.log('\n🔍 Detailed Results:');
    Object.keys(results).forEach(questionNumber => {
      const result = results[questionNumber];
      const status = result.isCorrect ? '✅' : '❌';
      console.log(`${status} Q${questionNumber}: ${JSON.stringify(result.userAnswer)} vs ${JSON.stringify(result.correctAnswer)} → ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
    });
    
  } catch (err) {
    console.error('❌ Error testing actual submission:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test
console.log('🚀 Testing Actual Test Submission and Marking...\n');
testActualSubmission(); 
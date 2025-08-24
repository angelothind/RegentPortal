require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

// Test the complete marking logic with all scenarios
const testCompleteMarkingLogic = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Test Book 19 Test 1 Listening
    console.log('\n🧪 Testing Complete Marking Logic for Book 19 Test 1...');
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (test1) {
      const listeningAnswers = test1.answers.get('listening') || [];
      const readingAnswers = test1.answers.get('reading') || [];
      
      console.log('📊 Database Answers loaded:');
      console.log(`- Listening: ${listeningAnswers.length} answers`);
      console.log(`- Reading: ${readingAnswers.length} answers`);
      
      // Test all marking scenarios
      console.log('\n🔍 Testing All Marking Scenarios:');
      
      // 1. Optional Answers (Single vs Array)
      console.log('\n📝 1. Optional Answers (Single vs Array):');
      const optionalTestCases = [
        { question: 1, studentAnswer: '69', correctAnswer: listeningAnswers[0], expected: true, description: 'Q1: Student "69" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: 'sixty-nine', correctAnswer: listeningAnswers[0], expected: true, description: 'Q1: Student "sixty-nine" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: '70', correctAnswer: listeningAnswers[0], expected: false, description: 'Q1: Student "70" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: 'sixty nine', correctAnswer: listeningAnswers[0], expected: false, description: 'Q1: Student "sixty nine" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: 'SIXTY-NINE', correctAnswer: listeningAnswers[0], expected: true, description: 'Q1: Student "SIXTY-NINE" vs ["69", "sixty-nine"] (case insensitive)' }
      ];
      
      optionalTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
      
      // 2. Either-Order Questions (Array vs Array)
      console.log('\n📝 2. Either-Order Questions (Array vs Array):');
      const eitherOrderTestCases = [
        { question: 21, studentAnswer: ['B', 'D'], correctAnswer: listeningAnswers[20], expected: true, description: 'Q21: Student ["B", "D"] vs ["B", "D"]' },
        { question: 21, studentAnswer: ['D', 'B'], correctAnswer: listeningAnswers[20], expected: true, description: 'Q21: Student ["D", "B"] vs ["B", "D"]' },
        { question: 21, studentAnswer: ['B', 'C'], correctAnswer: listeningAnswers[20], expected: false, description: 'Q21: Student ["B", "C"] vs ["B", "D"]' },
        { question: 21, studentAnswer: ['B'], correctAnswer: listeningAnswers[20], expected: false, description: 'Q21: Student ["B"] vs ["B", "D"]' },
        { question: 21, studentAnswer: ['B', 'D', 'E'], correctAnswer: listeningAnswers[20], expected: false, description: 'Q21: Student ["B", "D", "E"] vs ["B", "D"]' }
      ];
      
      eitherOrderTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
      
      // 3. Single Answer Questions
      console.log('\n📝 3. Single Answer Questions:');
      const singleTestCases = [
        { question: 9, studentAnswer: '4.95', correctAnswer: listeningAnswers[8], expected: true, description: 'Q9: Student "4.95" vs "4.95"' },
        { question: 9, studentAnswer: '5.00', correctAnswer: listeningAnswers[8], expected: false, description: 'Q9: Student "5.00" vs "4.95"' },
        { question: 9, studentAnswer: '4.9', correctAnswer: listeningAnswers[8], expected: false, description: 'Q9: Student "4.9" vs "4.95"' },
        { question: 9, studentAnswer: '4.95 ', correctAnswer: listeningAnswers[8], expected: true, description: 'Q9: Student "4.95 " vs "4.95" (with trailing space)' }
      ];
      
      singleTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
      
      // 4. Reading Optional Answers
      console.log('\n📝 4. Reading Optional Answers:');
      const readingOptionalTestCases = [
        { question: 11, studentAnswer: 'intestines', correctAnswer: readingAnswers[10], expected: true, description: 'Q11: Student "intestines" vs ["intestines", "gut"]' },
        { question: 11, studentAnswer: 'gut', correctAnswer: readingAnswers[10], expected: true, description: 'Q11: Student "gut" vs ["intestines", "gut"]' },
        { question: 11, studentAnswer: 'stomach', correctAnswer: readingAnswers[10], expected: false, description: 'Q11: Student "stomach" vs ["intestines", "gut"]' },
        { question: 11, studentAnswer: 'GUT', correctAnswer: readingAnswers[10], expected: true, description: 'Q11: Student "GUT" vs ["intestines", "gut"] (case insensitive)' }
      ];
      
      readingOptionalTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
      
      // 5. Edge Cases
      console.log('\n📝 5. Edge Cases:');
      const edgeTestCases = [
        { question: 'edge1', studentAnswer: '', correctAnswer: 'test', expected: false, description: 'Empty student answer vs single correct' },
        { question: 'edge2', studentAnswer: null, correctAnswer: 'test', expected: false, description: 'Null student answer vs single correct' },
        { question: 'edge3', studentAnswer: undefined, correctAnswer: 'test', expected: false, description: 'Undefined student answer vs single correct' },
        { question: 'edge4', studentAnswer: ['A'], correctAnswer: 'B', expected: false, description: 'Array student answer vs single correct' },
        { question: 'edge5', studentAnswer: 'test', correctAnswer: [], expected: false, description: 'Single student answer vs empty array correct' }
      ];
      
      edgeTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error testing complete marking logic:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Mock marking logic function (same as in submitTest.js)
const testMarkingLogic = (studentAnswer, correctAnswer) => {
  // Handle arrays (optional answers or either-order)
  if (Array.isArray(correctAnswer)) {
    // Check if student answer matches any of the correct options
    if (Array.isArray(studentAnswer) && studentAnswer.length > 0) {
      // For either-order questions, check if all answers are present
      if (studentAnswer.length === correctAnswer.length) {
        const sortedStudent = [...studentAnswer].sort();
        const sortedCorrect = [...correctAnswer].sort();
        return JSON.stringify(sortedStudent) === JSON.stringify(sortedCorrect);
      }
      return false;
    } else if (studentAnswer && !Array.isArray(studentAnswer)) {
      // Single student answer against array correct answer (optional answers)
      // Check if the single answer matches any of the correct options
      const normalizedUserAnswer = studentAnswer.toString().trim();
      const isAnswerCorrect = correctAnswer.some(correctOption => 
        correctOption.toString().trim().toLowerCase() === normalizedUserAnswer.toLowerCase()
      );
      return isAnswerCorrect;
    } else {
      return false;
    }
  }
  
  // Handle single answers
  if (Array.isArray(studentAnswer)) {
    return false; // Student gave array but correct answer is single
  }
  
  // Direct comparison for single answers
  return studentAnswer === correctAnswer;
};

// Run the test
console.log('🚀 Testing Complete Marking Logic...\n');
testCompleteMarkingLogic(); 
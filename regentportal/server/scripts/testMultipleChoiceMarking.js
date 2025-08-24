require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

// Test the marking logic with database answers for multiple choice and optional answers
const testMultipleChoiceMarking = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Test Book 19 Test 1 Listening
    console.log('\n🧪 Testing Book 19 Test 1 Listening - Multiple Choice and Optional Answers...');
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (test1) {
      const listeningAnswers = test1.answers.get('listening') || [];
      console.log('📊 Database Listening Answers loaded:', listeningAnswers.length);
      
      // Test specific question types
      console.log('\n🔍 Testing Optional Answers (Single vs Array):');
      const optionalTestCases = [
        { question: 1, studentAnswer: '69', correctAnswer: listeningAnswers[0], expected: true, description: 'Q1: Student "69" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: 'sixty-nine', correctAnswer: listeningAnswers[0], expected: true, description: 'Q1: Student "sixty-nine" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: '70', correctAnswer: listeningAnswers[0], expected: false, description: 'Q1: Student "70" vs ["69", "sixty-nine"]' },
        { question: 1, studentAnswer: 'sixty nine', correctAnswer: listeningAnswers[0], expected: false, description: 'Q1: Student "sixty nine" vs ["69", "sixty-nine"]' }
      ];
      
      optionalTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
      
      console.log('\n🔍 Testing Either-Order Questions (Array vs Array):');
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
      
      console.log('\n🔍 Testing Single Answer Questions:');
      const singleTestCases = [
        { question: 9, studentAnswer: '4.95', correctAnswer: listeningAnswers[8], expected: true, description: 'Q9: Student "4.95" vs "4.95"' },
        { question: 9, studentAnswer: '5.00', correctAnswer: listeningAnswers[8], expected: false, description: 'Q9: Student "5.00" vs "4.95"' },
        { question: 9, studentAnswer: '4.9', correctAnswer: listeningAnswers[8], expected: false, description: 'Q9: Student "4.9" vs "4.95"' }
      ];
      
      singleTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
    }
    
    // Test Book 19 Test 1 Reading
    console.log('\n🧪 Testing Book 19 Test 1 Reading - Multiple Choice and Optional Answers...');
    if (test1) {
      const readingAnswers = test1.answers.get('reading') || [];
      console.log('📊 Database Reading Answers loaded:', readingAnswers.length);
      
      console.log('\n🔍 Testing Optional Answers in Reading:');
      const readingOptionalTestCases = [
        { question: 11, studentAnswer: 'intestines', correctAnswer: readingAnswers[10], expected: true, description: 'Q11: Student "intestines" vs ["intestines", "gut"]' },
        { question: 11, studentAnswer: 'gut', correctAnswer: readingAnswers[10], expected: true, description: 'Q11: Student "gut" vs ["intestines", "gut"]' },
        { question: 11, studentAnswer: 'stomach', correctAnswer: readingAnswers[10], expected: false, description: 'Q11: Student "stomach" vs ["intestines", "gut"]' }
      ];
      
      readingOptionalTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
      
      console.log('\n🔍 Testing Either-Order Questions in Reading:');
      const readingEitherOrderTestCases = [
        { question: 20, studentAnswer: ['B', 'D'], correctAnswer: readingAnswers[19], expected: true, description: 'Q20: Student ["B", "D"] vs ["B", "D"]' },
        { question: 20, studentAnswer: ['D', 'B'], correctAnswer: readingAnswers[19], expected: true, description: 'Q20: Student ["D", "B"] vs ["B", "D"]' },
        { question: 20, studentAnswer: ['B', 'C'], correctAnswer: readingAnswers[19], expected: false, description: 'Q20: Student ["B", "C"] vs ["B", "D"]' }
      ];
      
      readingEitherOrderTestCases.forEach(testCase => {
        const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} ${testCase.description} → ${result} (Expected: ${testCase.expected})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error testing multiple choice marking:', err.message);
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
    } else {
      // Single student answer against multiple correct options
      return correctAnswer.includes(studentAnswer);
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
console.log('🚀 Testing Multiple Choice and Optional Answer Marking Logic...\n');
testMultipleChoiceMarking(); 
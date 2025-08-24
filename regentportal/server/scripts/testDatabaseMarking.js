require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

// Mock the loadCorrectAnswers function to test database priority
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
          const dbAnswers = {};
          testTypeAnswers.forEach((answer, index) => {
            dbAnswers[(index + 1).toString()] = answer; // Convert to 1-based question numbers
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
    
    console.log(`❌ No correct answers found for ${testType} in database`);
    return {};
    
  } catch (error) {
    console.error('❌ Error loading correct answers:', error);
    throw error;
  }
};

// Test the marking logic with database answers
const testDatabaseMarking = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Test Book 19 Test 1 Listening
    console.log('\n🧪 Testing Book 19 Test 1 Listening...');
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (test1) {
      const listeningAnswers = await loadCorrectAnswers(test1._id, 'listening', {});
      console.log('📊 Database Listening Answers:', listeningAnswers);
      
      // Test specific questions
      console.log('\n🔍 Testing specific questions:');
      console.log('Q1 (69/sixty-nine):', listeningAnswers['1']);
      console.log('Q21 (either order):', listeningAnswers['21']);
      console.log('Q9 (single):', listeningAnswers['9']);
      
      // Test marking logic
      console.log('\n✅ Marking Logic Test:');
      const testCases = [
        { question: '1', studentAnswer: '69', expected: true },
        { question: '1', studentAnswer: 'sixty-nine', expected: true },
        { question: '1', studentAnswer: '70', expected: false },
        { question: '21', studentAnswer: ['B', 'D'], expected: true },
        { question: '21', studentAnswer: ['D', 'B'], expected: true },
        { question: '21', studentAnswer: ['B', 'C'], expected: false },
        { question: '9', studentAnswer: '4.95', expected: true },
        { question: '9', studentAnswer: '5.00', expected: false }
      ];
      
      testCases.forEach(testCase => {
        const correctAnswer = listeningAnswers[testCase.question];
        const isCorrect = testMarkingLogic(testCase.studentAnswer, correctAnswer);
        const status = isCorrect === testCase.expected ? '✅' : '❌';
        console.log(`${status} Q${testCase.question}: Student "${JSON.stringify(testCase.studentAnswer)}" vs Correct ${JSON.stringify(correctAnswer)} → ${isCorrect} (Expected: ${testCase.expected})`);
      });
    }
    
    // Test Book 19 Test 1 Reading
    console.log('\n🧪 Testing Book 19 Test 1 Reading...');
    if (test1) {
      const readingAnswers = await loadCorrectAnswers(test1._id, 'reading', {});
      console.log('📊 Database Reading Answers:', readingAnswers);
      
      // Test specific questions
      console.log('\n🔍 Testing specific questions:');
      console.log('Q1 (TFNG):', readingAnswers['1']);
      console.log('Q11 (intestines/gut):', readingAnswers['11']);
      console.log('Q20 (either order):', readingAnswers['20']);
      
      // Test marking logic
      console.log('\n✅ Marking Logic Test:');
      const readingTestCases = [
        { question: '1', studentAnswer: 'FALSE', expected: true },
        { question: '1', studentAnswer: 'TRUE', expected: false },
        { question: '11', studentAnswer: 'intestines', expected: true },
        { question: '11', studentAnswer: 'gut', expected: true },
        { question: '11', studentAnswer: 'stomach', expected: false },
        { question: '20', studentAnswer: ['B', 'D'], expected: true },
        { question: '20', studentAnswer: ['D', 'B'], expected: true },
        { question: '20', studentAnswer: ['B', 'C'], expected: false }
      ];
      
      readingTestCases.forEach(testCase => {
        const correctAnswer = readingAnswers[testCase.question];
        const isCorrect = testMarkingLogic(testCase.studentAnswer, correctAnswer);
        const status = isCorrect === testCase.expected ? '✅' : '❌';
        console.log(`${status} Q${testCase.question}: Student "${JSON.stringify(testCase.studentAnswer)}" vs Correct ${JSON.stringify(correctAnswer)} → ${isCorrect} (Expected: ${testCase.expected})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error testing database marking:', err.message);
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
console.log('🚀 Testing Database Marking Logic...\n');
testDatabaseMarking(); 
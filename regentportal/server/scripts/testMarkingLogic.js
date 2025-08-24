require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

// Mock marking logic function to test
const testMarkingLogic = (studentAnswer, correctAnswer) => {
  // Handle arrays (optional answers or either-order)
  if (Array.isArray(correctAnswer)) {
    // Check if student answer matches any of the correct options
    if (Array.isArray(studentAnswer)) {
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

// Test cases for different answer formats
const testCases = [
  // Test 1: Optional answers (single student answer against array)
  {
    description: "Optional answer - student gives '69', correct is ['69', 'sixty-nine']",
    studentAnswer: "69",
    correctAnswer: ["69", "sixty-nine"],
    expected: true
  },
  {
    description: "Optional answer - student gives 'sixty-nine', correct is ['69', 'sixty-nine']",
    studentAnswer: "sixty-nine",
    correctAnswer: ["69", "sixty-nine"],
    expected: true
  },
  {
    description: "Optional answer - student gives '70', correct is ['69', 'sixty-nine']",
    studentAnswer: "70",
    correctAnswer: ["69", "sixty-nine"],
    expected: false
  },
  
  // Test 2: Either-order questions (array vs array)
  {
    description: "Either-order - student gives ['B', 'D'], correct is ['B', 'D']",
    studentAnswer: ["B", "D"],
    correctAnswer: ["B", "D"],
    expected: true
  },
  {
    description: "Either-order - student gives ['D', 'B'], correct is ['B', 'D']",
    studentAnswer: ["D", "B"],
    correctAnswer: ["B", "D"],
    expected: true
  },
  {
    description: "Either-order - student gives ['B', 'C'], correct is ['B', 'D']",
    studentAnswer: ["B", "C"],
    correctAnswer: ["B", "D"],
    expected: false
  },
  {
    description: "Either-order - student gives ['B'], correct is ['B', 'D']",
    studentAnswer: ["B"],
    correctAnswer: ["B", "D"],
    expected: false
  },
  
  // Test 3: Single answers
  {
    description: "Single answer - student gives 'stream', correct is 'stream'",
    studentAnswer: "stream",
    correctAnswer: "stream",
    expected: true
  },
  {
    description: "Single answer - student gives 'stream', correct is 'river'",
    studentAnswer: "stream",
    correctAnswer: "river",
    expected: false
  },
  
  // Test 4: Edge cases
  {
    description: "Student gives array but correct is single",
    studentAnswer: ["A", "B"],
    correctAnswer: "A",
    expected: false
  },
  {
    description: "Student gives single but correct is array",
    studentAnswer: "A",
    correctAnswer: ["A", "B"],
    expected: true
  },
  
  // Test 5: Complex optional answers
  {
    description: "Multiple time formats - student gives '3.30', correct is ['3.30', 'three thirty', '½', 'half 3', 'three']",
    studentAnswer: "3.30",
    correctAnswer: ["3.30", "three thirty", "½", "half 3", "three"],
    expected: true
  },
  {
    description: "Multiple time formats - student gives 'three thirty', correct is ['3.30', 'three thirty', '½', 'half 3', 'three']",
    studentAnswer: "three thirty",
    correctAnswer: ["3.30", "three thirty", "½", "half 3", "three"],
    expected: true
  },
  {
    description: "Multiple time formats - student gives 'half past three', correct is ['3.30', 'three thirty', '½', 'half 3', 'three']",
    studentAnswer: "half past three",
    correctAnswer: ["3.30", "three thirty", "½", "half 3", "three"],
    expected: false
  }
];

// Run all test cases
const runTests = () => {
  console.log('🧪 Testing Marking Logic for Different Answer Formats\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = testMarkingLogic(testCase.studentAnswer, testCase.correctAnswer);
    const passed = result === testCase.expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    } else {
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
      console.log(`   Student: ${JSON.stringify(testCase.studentAnswer)}`);
      console.log(`   Correct: ${JSON.stringify(testCase.correctAnswer)}`);
    }
  });
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Marking logic is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the marking logic.');
  }
};

// Test with actual database data
const testDatabaseAnswers = async () => {
  try {
    await connectDB();
    console.log('\n🔍 Testing with actual database data...\n');
    
    // Test Book 19 Test 1 Listening
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    if (test1 && test1.answers) {
      const listeningAnswers = test1.answers.get('listening') || [];
      
      console.log('📝 Book 19 Test 1 Listening - Sample Tests:');
      
      // Test Q1 (optional answer)
      const q1Correct = listeningAnswers[0]; // ["69", "sixty-nine"]
      console.log(`Q1: Student "69" vs Correct ${JSON.stringify(q1Correct)} → ${testMarkingLogic("69", q1Correct)}`);
      console.log(`Q1: Student "sixty-nine" vs Correct ${JSON.stringify(q1Correct)} → ${testMarkingLogic("sixty-nine", q1Correct)}`);
      console.log(`Q1: Student "70" vs Correct ${JSON.stringify(q1Correct)} → ${testMarkingLogic("70", q1Correct)}`);
      
      // Test Q21-22 (either order)
      const q21Correct = listeningAnswers[20]; // ["B", "D"]
      console.log(`Q21: Student ["B", "D"] vs Correct ${JSON.stringify(q21Correct)} → ${testMarkingLogic(["B", "D"], q21Correct)}`);
      console.log(`Q21: Student ["D", "B"] vs Correct ${JSON.stringify(q21Correct)} → ${testMarkingLogic(["D", "B"], q21Correct)}`);
      console.log(`Q21: Student ["B", "C"] vs Correct ${JSON.stringify(q21Correct)} → ${testMarkingLogic(["B", "C"], q21Correct)}`);
      
      // Test Q9 (single answer)
      const q9Correct = listeningAnswers[8]; // "4.95"
      console.log(`Q9: Student "4.95" vs Correct ${JSON.stringify(q9Correct)} → ${testMarkingLogic("4.95", q9Correct)}`);
      console.log(`Q9: Student "5.00" vs Correct ${JSON.stringify(q9Correct)} → ${testMarkingLogic("5.00", q9Correct)}`);
    }
    
    // Test Book 19 Test 3 Listening (complex optional answers)
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book19' });
    if (test3 && test3.answers) {
      const listeningAnswers = test3.answers.get('listening') || [];
      
      console.log('\n📝 Book 19 Test 3 Listening - Complex Optional Answers:');
      
      // Test Q3 (multiple time formats)
      const q3Correct = listeningAnswers[2]; // ["3.30", "three thirty", "½", "half 3", "three"]
      console.log(`Q3: Student "3.30" vs Correct ${JSON.stringify(q3Correct)} → ${testMarkingLogic("3.30", q3Correct)}`);
      console.log(`Q3: Student "three thirty" vs Correct ${JSON.stringify(q3Correct)} → ${testMarkingLogic("three thirty", q3Correct)}`);
      console.log(`Q3: Student "half past three" vs Correct ${JSON.stringify(q3Correct)} → ${testMarkingLogic("half past three", q3Correct)}`);
    }
    
  } catch (err) {
    console.error('❌ Error testing database answers:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the tests
console.log('🚀 Starting Marking Logic Tests...\n');
runTests();

// Test with database data
testDatabaseAnswers(); 
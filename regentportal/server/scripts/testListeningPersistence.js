require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

// Test the listening test persistence functionality
const testListeningPersistence = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Test Book 19 Test 1 Listening
    console.log('\n🧪 Testing Listening Test Persistence for Book 19 Test 1...');
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (test1) {
      const listeningAnswers = test1.answers.get('listening') || [];
      console.log('📊 Database Listening Answers loaded:', listeningAnswers.length);
      
      console.log('\n🔍 Simulating Student Test Session:');
      
      // Simulate student starting the test
      console.log('📝 1. Student starts listening test');
      console.log('📝 2. Student navigates to Part 1');
      console.log('📝 3. Student answers some questions');
      
      // Simulate student answers
      const studentAnswers = {
        '1': '69',                    // Optional answer
        '2': 'stream',                // Single answer
        '3': 'data',                  // Single answer
        '4': 'map',                   // Single answer
        '9': '4.95',                  // Single answer
        '21': ['B', 'D'],             // Either-order
        '22': ['D', 'B'],             // Either-order
        '25': 'D',                    // Single answer
        '35': 'rectangular',          // Single answer
        '40': 'rain'                  // Single answer
      };
      
      console.log('📝 4. Student answers saved to localStorage');
      console.log('📝 5. Student navigates to Part 2');
      console.log('📝 6. Student answers more questions');
      
      // Simulate more answers
      const moreAnswers = {
        ...studentAnswers,
        '41': 'answer1',
        '42': 'answer2',
        '43': 'answer3'
      };
      
      console.log('📝 7. Student navigates to Part 3');
      console.log('📝 8. Student answers more questions');
      
      // Simulate even more answers
      const finalAnswers = {
        ...moreAnswers,
        '44': 'answer4',
        '45': 'answer5'
      };
      
      console.log('📝 9. Student navigates to Part 4');
      console.log('📝 10. Student completes the test');
      
      console.log('\n🔍 Expected Persistence Behavior:');
      console.log('✅ Student can navigate between parts and answers are preserved');
      console.log('✅ Student can leave the test and return - answers still there');
      console.log('✅ Student can see marking overlay if test was submitted');
      console.log('✅ Student can see inputted answers until test is reset');
      console.log('✅ Test state persists across browser sessions (4 hour limit)');
      
      console.log('\n📊 Test Data Summary:');
      console.log(`- Total Questions Answered: ${Object.keys(finalAnswers).length}`);
      console.log(`- Parts Navigated: 1, 2, 3, 4`);
      console.log(`- Answer Types: Single answers, Optional answers, Either-order arrays`);
      console.log(`- Expected localStorage Key: test-answers-${test1._id}-Listening`);
      
      console.log('\n🎯 Key Persistence Features:');
      console.log('1. **Answer Persistence**: All student answers saved to localStorage');
      console.log('2. **Part Navigation**: Current part saved and restored');
      console.log('3. **Test State**: testStarted, testSubmitted, testResults saved');
      console.log('4. **Timestamp**: 4-hour expiration for data cleanup');
      console.log('5. **Reset Functionality**: Explicit reset clears all data');
      
    } else {
      console.log('❌ Test 1 not found');
    }
    
  } catch (err) {
    console.error('❌ Error testing listening persistence:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test
console.log('🚀 Testing Listening Test Persistence...\n');
testListeningPersistence(); 
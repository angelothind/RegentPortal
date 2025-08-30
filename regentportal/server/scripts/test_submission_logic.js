// server/scripts/test_submission_logic.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');

const testSubmissionLogic = async () => {
  try {
    console.log('🔄 Testing submission logic...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check all tests to see their IDs
    console.log('\n🔍 All Tests in Database:');
    console.log('==========================');
    const allTests = await Test.find({});
    
    allTests.forEach(test => {
      console.log(`ID: ${test._id}`);
      console.log(`Title: ${test.title}`);
      console.log(`BelongsTo: ${test.belongsTo}`);
      console.log(`Has answers: ${test.answers ? 'Yes' : 'No'}`);
      if (test.answers) {
        console.log(`Answer types: ${Array.from(test.answers.keys()).join(', ')}`);
      }
      console.log('---');
    });

    // Check recent submissions to see if there are any with wrong testIds
    console.log('\n🔍 Recent Test Submissions:');
    console.log('============================');
    const recentSubmissions = await TestSubmission.find({})
      .sort({ submittedAt: -1 })
      .limit(10);
    
    if (recentSubmissions.length === 0) {
      console.log('No submissions found');
    } else {
      recentSubmissions.forEach(submission => {
        console.log(`Submission ID: ${submission._id}`);
        console.log(`Student: ${submission.studentId}`);
        console.log(`Test ID: ${submission.testId}`);
        console.log(`Test Type: ${submission.testType}`);
        console.log(`Score: ${submission.score}%`);
        console.log(`Submitted: ${submission.submittedAt}`);
        console.log('---');
      });
    }

    // Test the loadCorrectAnswers function logic
    console.log('\n🔍 Testing loadCorrectAnswers Logic:');
    console.log('=====================================');
    
    // Get Book19 Test1 and Book17 Test1
    const book19Test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    const book17Test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book17' });
    
    if (book19Test1 && book17Test1) {
      console.log('✅ Found both tests for comparison');
      
      console.log('\n📊 Book19 Test1:');
      console.log(`ID: ${book19Test1._id}`);
      console.log(`Title: ${book19Test1.title}`);
      console.log(`BelongsTo: ${book19Test1.belongsTo}`);
      
      if (book19Test1.answers && book19Test1.answers.has('listening')) {
        const listeningAnswers = book19Test1.answers.get('listening');
        console.log(`Listening answers: ${listeningAnswers.length} questions`);
        console.log(`Q21: ${JSON.stringify(listeningAnswers[20])}`);
        console.log(`Q22: ${JSON.stringify(listeningAnswers[21])}`);
      }
      
      console.log('\n📊 Book17 Test1:');
      console.log(`ID: ${book17Test1._id}`);
      console.log(`Title: ${book17Test1.title}`);
      console.log(`BelongsTo: ${book17Test1.belongsTo}`);
      
      if (book17Test1.answers && book17Test1.answers.has('listening')) {
        const listeningAnswers = book17Test1.answers.get('listening');
        console.log(`Listening answers: ${listeningAnswers.length} questions`);
        console.log(`Q16: ${JSON.stringify(listeningAnswers[15])}`);
        console.log(`Q17: ${JSON.stringify(listeningAnswers[16])}`);
      }
      
      console.log('\n🔍 ID Comparison:');
      console.log(`Book19 Test1 ID: ${book19Test1._id}`);
      console.log(`Book17 Test1 ID: ${book17Test1._id}`);
      console.log(`IDs are different: ${book19Test1._id.toString() !== book17Test1._id.toString()}`);
      
    } else {
      console.log('❌ Could not find both tests for comparison');
    }

    console.log('\n🎯 ANALYSIS:');
    console.log('=============');
    console.log('If the frontend is sending the wrong testId, it could be due to:');
    console.log('1. Cached selectedTest state in React');
    console.log('2. localStorage not being cleared properly between tests');
    console.log('3. Race conditions when switching between tests');
    console.log('4. The selectedTest.testId._id being corrupted');
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('======================');
    console.log('1. Clear selectedTest state when switching tests');
    console.log('2. Add validation that testId matches the expected test');
    console.log('3. Clear localStorage when switching tests');
    console.log('4. Add logging to track testId changes');

  } catch (error) {
    console.error('❌ Error during submission logic test:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test
testSubmissionLogic(); 
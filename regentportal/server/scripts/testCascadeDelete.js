// server/scripts/testCascadeDelete.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const TestSubmission = require('../models/TestSubmission');
const Test = require('../models/Test');

const testCascadeDelete = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get the first student and test
    const student = await Student.findOne({ username: 'student1' });
    const test = await Test.findOne();
    
    if (!student || !test) {
      console.log('❌ Need both student and test to proceed');
      return;
    }

    console.log(`📝 Testing with student: ${student.username} and test: ${test.title}`);

    // Create a test submission
    const submission = new TestSubmission({
      studentId: student._id,
      testId: test._id,
      testType: 'reading',
      answers: new Map([['q1', 'answer1'], ['q2', 'answer2']]),
      correctAnswers: new Map([['q1', 'correct1'], ['q2', 'correct2']]),
      results: new Map([['q1', true], ['q2', false]]),
      score: 50,
      totalQuestions: 2,
      correctCount: 1
    });

    await submission.save();
    console.log('✅ Test submission created');

    // Verify submission exists
    const submissionsBefore = await TestSubmission.find({ studentId: student._id });
    console.log(`📊 Submissions before deletion: ${submissionsBefore.length}`);

    // Delete the student
    console.log('🗑️  Deleting student...');
    await Student.deleteOne({ _id: student._id });
    console.log('✅ Student deleted');

    // Check if submissions were also deleted
    const submissionsAfter = await TestSubmission.find({ studentId: student._id });
    console.log(`📊 Submissions after deletion: ${submissionsAfter.length}`);

    if (submissionsAfter.length === 0) {
      console.log('✅ SUCCESS: Cascade delete working - all submissions removed!');
    } else {
      console.log('❌ FAIL: Cascade delete not working - submissions still exist');
    }

  } catch (err) {
    console.error('❌ Error testing cascade delete:', err);
  } finally {
    mongoose.connection.close();
  }
};

testCascadeDelete(); 
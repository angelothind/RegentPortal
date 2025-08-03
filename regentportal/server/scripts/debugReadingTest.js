// server/scripts/debugReadingTest.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const debugReadingTest = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1
    const test = await Test.findOne({ title: 'Test 1' });
    if (!test) {
      console.error('❌ Test 1 not found');
      return;
    }

    console.log('📝 Test found:', test.title);
    console.log('📝 Test ID:', test._id);
    
    // Check if answers exist in database
    if (test.answers && test.answers.size > 0) {
      console.log('✅ Answers exist in database');
      console.log('📝 Map size:', test.answers.size);
      
      // Check what keys exist
      const keys = [];
      test.answers.forEach((value, key) => {
        keys.push(key);
      });
      console.log('📝 Available keys:', keys);
      
      // Check reading answers specifically
      const readingAnswers = test.answers.get('reading');
      if (readingAnswers) {
        console.log('✅ Reading answers found in database');
        console.log('📝 Number of reading answers:', readingAnswers.length);
        console.log('📝 First 5 reading answers:', readingAnswers.slice(0, 5));
        console.log('📝 Question 20 (should be array):', readingAnswers[19]);
      } else {
        console.log('❌ No reading answers found in database');
      }
      
      // Check listening answers
      const listeningAnswers = test.answers.get('listening');
      if (listeningAnswers) {
        console.log('✅ Listening answers found in database');
        console.log('📝 Number of listening answers:', listeningAnswers.length);
      }
    } else {
      console.log('❌ No answers found in database');
    }

    // Simulate the exact submission logic
    console.log('\n🔍 Testing submission logic...');
    
    const testId = test._id;
    const testType = 'reading';
    const submittedAnswers = {
      "1": "FALSE",
      "2": "FALSE",
      "8": "paint",
      "20": ["B", "D"]
    };

    console.log('📝 Test parameters:');
    console.log('   testId:', testId);
    console.log('   testType:', testType);
    console.log('   submittedAnswers:', submittedAnswers);

    // Simulate loadCorrectAnswers function
    const loadCorrectAnswers = async (testId, testType, submittedAnswers = {}) => {
      try {
        const test = await Test.findById(testId);
        if (!test) {
          throw new Error('Test not found');
        }

        const correctAnswers = {};
        
        console.log(`🔍 Checking for ${testType} answers in database...`);
        if (test.answers && test.answers.size > 0) {
          console.log('✅ Found answers in database');
          
          const testTypeAnswers = test.answers.get(testType.toLowerCase());
          console.log('📝 testTypeAnswers:', testTypeAnswers);
          console.log('📝 testTypeAnswers type:', typeof testTypeAnswers);
          console.log('📝 testTypeAnswers isArray:', Array.isArray(testTypeAnswers));
          
          if (testTypeAnswers && Array.isArray(testTypeAnswers)) {
            console.log(`📝 Found ${testTypeAnswers.length} ${testType} answers in database`);
            
            const dbAnswers = {};
            testTypeAnswers.forEach((answer, index) => {
              dbAnswers[(index + 1).toString()] = answer;
            });
            
            console.log(`✅ Loaded ${Object.keys(dbAnswers).length} correct answers from database for ${testType}`);
            console.log('📝 Sample dbAnswers:', {
              '1': dbAnswers['1'],
              '8': dbAnswers['8'],
              '20': dbAnswers['20']
            });
            return dbAnswers;
          } else {
            console.log('❌ testTypeAnswers is not an array or is null');
          }
        } else {
          console.log('❌ No answers found in database');
        }
        
        console.log(`📝 Falling back to JSON files...`);
        return {};
        
      } catch (error) {
        console.error('❌ Error loading correct answers:', error);
        throw error;
      }
    };

    const correctAnswers = await loadCorrectAnswers(testId, testType, submittedAnswers);
    console.log('📝 Final correctAnswers:', correctAnswers);

  } catch (err) {
    console.error('❌ Error debugging reading test:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

debugReadingTest(); 
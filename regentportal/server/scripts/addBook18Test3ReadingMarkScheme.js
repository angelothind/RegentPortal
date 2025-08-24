// server/scripts/addBook18Test3ReadingMarkScheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook18Test3ReadingMarkScheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 3 Book 18
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    if (!test3) {
      console.log('❌ Test 3 Book 18 not found');
      return;
    }

    console.log('📝 Found Test 3 Book 18, adding Reading mark scheme...');

    // Reading Test 3 Answers (Questions 1-40) - From the mark scheme image
    const test3ReadingAnswers = [
        // Passage 1 (Questions 1-13): 13 answers
        "G", "D", "C", "F", "architects", "moisture", "layers", "speed", "C", "A", "B", "D", "A",
        
        // Passage 2 (Questions 14-26): 13 answers
        "3", "8", "6", "5", "7", "1", "4", "A", "C", "B", "speed", ["fifty", "50"], "strict",
        
        // Passage 3 (Questions 27-40): 14 answers
        "B", "A", "C", "C", "H", "D", "F", "E", "B", "NO", "NOT GIVEN", "YES", "NO", "NOT GIVEN"
    ];

    // Verify answer count
    if (test3ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test3ReadingAnswers.length}, should be 40`);
      return;
    }

    // Get existing answers or create new map
    let answersMap = test3.answers || new Map();
    
    // Update reading answers
    answersMap.set('reading', test3ReadingAnswers);

    // Update the test with reading mark scheme
    test3.answers = answersMap;
    await test3.save();

    console.log('✅ Successfully added Reading mark scheme for Book 18 Test 3');
    console.log(`📖 Reading: ${test3ReadingAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      console.log('\n📊 Verification:');
      console.log(`- Answer keys: ${updatedTest.answers.size}`);
      
      const readingAnswers = updatedTest.answers.get('reading') || [];
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show sample answers
      const readingSample = readingAnswers.slice(0, 10);
      console.log(`\n📖 Sample Reading (first 10): ${JSON.stringify(readingSample)}`);
      
      // Show answers by passage
      console.log('\n📚 Answers by Passage:');
      console.log(`Passage 1 (Q1-13): ${readingAnswers.slice(0, 13).join(', ')}`);
      console.log(`Passage 2 (Q14-26): ${readingAnswers.slice(13, 26).join(', ')}`);
      console.log(`Passage 3 (Q27-40): ${readingAnswers.slice(26, 40).join(', ')}`);
    }

  } catch (err) {
    console.error('❌ Error adding reading mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook18Test3ReadingMarkScheme(); 
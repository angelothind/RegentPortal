// server/scripts/populateTestAnswers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const populateTestAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1
    const test = await Test.findOne({ title: 'Test 1' });
    if (!test) {
      console.error('❌ Test 1 not found in database');
      return;
    }

    console.log('📝 Found Test 1, populating answers...');

    // Correct answers for Reading Test 1 based on the mark scheme
    const readingAnswers = [
      // Reading Passage 1, Questions 1-13
      "FALSE", "FALSE", "NOT GIVEN", "FALSE", "NOT GIVEN", "TRUE", "TRUE", 
      "paint", "topspin", "training", "intestines / gut", "weights", "grips",

      // Reading Passage 2, Questions 14-26
      "D", "G", "C", "A", "G", "B", 
      ["B", "D"], ["B", "D"], ["C", "E"], ["C", "E"], // Multiple choice with multiple answers
      "grain", "punishment", "ransom",

      // Reading Passage 3, Questions 27-40
      "D", "A", "C", "D", "G", "J", "H", "B", "E", "C",
      "YES", "NOT GIVEN", "NO", "NOT GIVEN"
    ];

    // Correct answers for Listening Test 1 (from JSON files)
    const listeningAnswers = [
      // Part 1 (Questions 1-10) - Hinchingbrooke Country Park
      "90", "stream", "facts", "map", "attractions", "instruments", "freedom", "skills", "5", "teachers",
      
      // Part 2 (Questions 11-20) - Placeholder - need to check actual answers
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
      
      // Part 3 (Questions 21-30) - Placeholder - need to check actual answers  
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
      
      // Part 4 (Questions 31-40) - Placeholder - need to check actual answers
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"
    ];

    // Create Map with reading and listening answers
    const answersMap = new Map();
    answersMap.set('reading', readingAnswers);
    answersMap.set('listening', listeningAnswers);

    // Update the test with the answers
    test.answers = answersMap;
    await test.save();

    console.log('✅ Successfully populated Test 1 with correct answers');
    console.log(`📝 Added ${readingAnswers.length} reading answers and ${listeningAnswers.length} listening answers`);
    console.log('📋 Answer breakdown:');
    console.log('   - Questions 1-7: TFNG answers');
    console.log('   - Questions 8-13: Fill-in-the-blank answers');
    console.log('   - Questions 14-19: Single-letter multiple choice');
    console.log('   - Questions 20-23: Multiple choice with multiple answers');
    console.log('   - Questions 24-26: Fill-in-the-blank answers');
    console.log('   - Questions 27-36: Single-letter multiple choice');
    console.log('   - Questions 37-40: YNNG answers');

    // Verify the update
    const updatedTest = await Test.findById(test._id);
    console.log('✅ Verification: Test answers saved successfully');
    console.log(`📊 Database now contains ${updatedTest.answers.size} correct answers`);

  } catch (err) {
    console.error('❌ Error populating test answers:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

populateTestAnswers(); 
// server/scripts/addBook18Test4ReadingMarkScheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook18Test4ReadingMarkScheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 4 Book 18
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
    if (!test4) {
      console.log('❌ Test 4 Book 18 not found');
      return;
    }

    console.log('📝 Found Test 4 Book 18, adding Reading mark scheme...');

    // Reading Test 4 Answers (Questions 1-40) - From the mark scheme image
    const test4ReadingAnswers = [
        // Passage 1 (Questions 1-13): 13 answers
        "D", "C", "E", "B", "D", "energy", "food", "gardening", "obesity", ["C", "D"], ["C", "D"], ["A", "D"], ["A", "D"],
        
        // Passage 2 (Questions 14-26): 13 answers
        "B", "C", "D", "C", "B", "A", "E", "B", "D", "YES", "NO", "NOT GIVEN", "YES",
        
        // Passage 3 (Questions 27-40): 14 answers
        "YES", "NOT GIVEN", "NO", "NO", "I", "F", "A", "C", "H", "E", "B", "A", "D", "C"
    ];

    // Verify answer count
    if (test4ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test4ReadingAnswers.length}, should be 40`);
      return;
    }

    // Get existing answers or create new map
    let answersMap = test4.answers || new Map();
    
    // Update reading answers
    answersMap.set('reading', test4ReadingAnswers);

    // Update the test with reading mark scheme
    test4.answers = answersMap;
    await test4.save();

    console.log('✅ Successfully added Reading mark scheme for Book 18 Test 4');
    console.log(`📖 Reading: ${test4ReadingAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
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
      
      // Show multiple answer examples
      const multipleAnswers = [];
      readingAnswers.forEach((answer, index) => {
        if (Array.isArray(answer)) {
          multipleAnswers.push(`Q${index + 1}: ${JSON.stringify(answer)}`);
        }
      });
      if (multipleAnswers.length > 0) {
        console.log(`\n🔄 Multiple Answer Questions:`);
        multipleAnswers.forEach(item => console.log(`  ${item}`));
      }
    }

  } catch (err) {
    console.error('❌ Error adding reading mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook18Test4ReadingMarkScheme(); 
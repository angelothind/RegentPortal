// server/scripts/addBook18Test3ListeningMarkScheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook18Test3ListeningMarkScheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 3 Book 18
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    if (!test3) {
      console.log('❌ Test 3 Book 18 not found');
      return;
    }

    console.log('📝 Found Test 3 Book 18, adding Listening mark scheme...');

    // Listening Test 3 Answers (Questions 1-40) - From the mark scheme image
    const test3ListeningAnswers = [
        "Marrowfield", "relative", ["socialise", "socialize"], "full", "Domestic Life", "clouds", "timing", "Animal Magic", ["animal movement", "movement"], "dark",
        
        // Part 2 (Questions 11-20): 10 answers
        ["B", "C"], ["B", "C"], ["B", "D"], ["B", "D"], "C", "B", "B", "C", "A", "A",
        
        // Part 3 (Questions 21-30): 10 answers
        ["A", "E"], ["A", "E"], ["B", "D"], ["B", "D"], "G", "E", "B", "C", "F", "A",
        
        // Part 4 (Questions 31-40): 10 answers
        "technical", "cheap", "thousands", "identification", "tracking", "military", "location", "prediction", "database", "trust"
    ];

    // Verify answer count
    if (test3ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test3ListeningAnswers.length}, should be 40`);
      return;
    }

    // Get existing answers or create new map
    let answersMap = test3.answers || new Map();
    
    // Update listening answers
    answersMap.set('listening', test3ListeningAnswers);

    // Update the test with listening mark scheme
    test3.answers = answersMap;
    await test3.save();

    console.log('✅ Successfully added Listening mark scheme for Book 18 Test 3');
    console.log(`🎵 Listening: ${test3ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      console.log('\n📊 Verification:');
      console.log(`- Answer keys: ${updatedTest.answers.size}`);
      
      const readingAnswers = updatedTest.answers.get('reading') || [];
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      console.log(`- Reading answers: ${readingAnswers.length}`);
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show sample answers
      const listeningSample = listeningAnswers.slice(0, 10);
      console.log(`\n🎵 Sample Listening (first 10): ${JSON.stringify(listeningSample)}`);
      
      // Show answers by part
      console.log('\n🎧 Answers by Part:');
      console.log(`Part 1 (Q1-10): ${listeningAnswers.slice(0, 10).join(', ')}`);
      console.log(`Part 2 (Q11-20): ${listeningAnswers.slice(10, 20).join(', ')}`);
      console.log(`Part 3 (Q21-30): ${listeningAnswers.slice(20, 30).join(', ')}`);
      console.log(`Part 4 (Q31-40): ${listeningAnswers.slice(30, 40).join(', ')}`);
      
      // Show multiple answer examples
      const multipleAnswers = [];
      listeningAnswers.forEach((answer, index) => {
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
    console.error('❌ Error adding listening mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook18Test3ListeningMarkScheme(); 
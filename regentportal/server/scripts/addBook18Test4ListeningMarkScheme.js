// server/scripts/addBook18Test4ListeningMarkScheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook18Test4ListeningMarkScheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 4 Book 18
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
    if (!test4) {
      console.log('❌ Test 4 Book 18 not found');
      return;
    }

    console.log('📝 Found Test 4 Book 18, adding Listening mark scheme...');

    // Listening Test 4 Answers (Questions 1-40) - From the mark scheme image
    const test4ListeningAnswers = [
        // Part 1 (Questions 1-10): 10 answers
        "receptionist", "Medical", "Chastons", "appointments", "database", "experience", "confident", "temporary", "1.15", "parking",
        
        // Part 2 (Questions 11-20): 10 answers
        "B", "A", "A", "C", "F", "G", "E", "A", "C", "B",
        
        // Part 3 (Questions 21-30): 10 answers
        ["B", "D"], ["B", "D"], "D", "A", "C", "G", "F", "A", "B", "C",
        
        // Part 4 (Questions 31-40): 10 answers
        "plot", "poverty", "Europe", "poetry", "drawings", "furniture", "lamps", ["harbour", "harbor"], "children", "relatives"
    ];

    // Verify answer count
    if (test4ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test4ListeningAnswers.length}, should be 40`);
      return;
    }

    // Get existing answers or create new map
    let answersMap = test4.answers || new Map();
    
    // Update listening answers
    answersMap.set('listening', test4ListeningAnswers);

    // Update the test with listening mark scheme
    test4.answers = answersMap;
    await test4.save();

    console.log('✅ Successfully added Listening mark scheme for Book 18 Test 4');
    console.log(`🎵 Listening: ${test4ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
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

addBook18Test4ListeningMarkScheme(); 
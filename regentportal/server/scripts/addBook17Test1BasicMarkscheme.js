// server/scripts/addBook17Test1BasicMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test1BasicMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1 Book 17
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (!test1) {
      console.log('❌ Test 1 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 1 Book 17, adding basic mark scheme structure...');

    // Create basic answer structure (40 questions each for reading and listening)
    const basicReadingAnswers = Array(40).fill('PLACEHOLDER');
    const basicListeningAnswers = Array(40).fill('PLACEHOLDER');

    // Create answers map
    const answersMap = new Map();
    answersMap.set('reading', basicReadingAnswers);
    answersMap.set('listening', basicListeningAnswers);

    // Update the test with basic mark scheme structure
    test1.answers = answersMap;
    await test1.save();

    console.log('✅ Successfully added basic mark scheme structure for Book 17 Test 1');
    console.log(`📖 Reading: ${basicReadingAnswers.length} placeholder answers`);
    console.log(`🎵 Listening: ${basicListeningAnswers.length} placeholder answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (updatedTest && updatedTest.answers) {
      console.log('\n📊 Verification:');
      console.log(`- Answer keys: ${updatedTest.answers.size}`);
      console.log(`- Reading answers: ${updatedTest.answers.get('reading')?.length || 0}`);
      console.log(`- Listening answers: ${updatedTest.answers.get('listening')?.length || 0}`);
      
      // Show sample answers
      const readingSample = updatedTest.answers.get('reading')?.slice(0, 5) || [];
      const listeningSample = updatedTest.answers.get('listening')?.slice(0, 5) || [];
      console.log(`\n📖 Sample Reading (first 5): ${JSON.stringify(readingSample)}`);
      console.log(`🎵 Sample Listening (first 5): ${JSON.stringify(listeningSample)}`);
    }

  } catch (err) {
    console.error('❌ Error adding basic mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook17Test1BasicMarkscheme(); 
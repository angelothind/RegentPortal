// server/scripts/updateTest2ListeningAnswers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const updateTest2ListeningAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Correct listening answers for Test 2 from the mark scheme
    const correctListeningAnswers = [
      "Mathieson",    // 1
      "beginners",    // 2
      "college",      // 3
      "New",          // 4
      "11",           // 5 (11 / eleven am)
      "instrument",   // 6
      "ear",          // 7
      "clapping",     // 8
      "recording",    // 9
      "alone",        // 10
      "A",            // 11
      "B",            // 12
      "A",            // 13
      "B",            // 14
      "C",            // 15
      "A",            // 16
      ["C", "E"],     // 17 (IN EITHER ORDER)
      ["C", "E"],     // 18 (IN EITHER ORDER)
      ["A", "B"],     // 19 (IN EITHER ORDER)
      ["A", "B"],     // 20 (IN EITHER ORDER)
      "A",            // 21
      "B",            // 22
      "B",            // 23
      "B",            // 24
      "E",            // 25
      "B",            // 26
      "A",            // 27
      "C",            // 28
      "C",            // 29
      "A",            // 30
      "move",         // 31
      "short",        // 32
      "discs",        // 33
      "oxygen",       // 34
      "tube",         // 35
      "temperatures", // 36
      "protein",      // 37
      "space",        // 38
      "seaweed",      // 39
      "endangered"    // 40
    ];

    // Find Test 2 and update its listening answers
    const test = await Test.findOne({ title: 'Test 2' });
    
    if (!test) {
      console.log('❌ Test 2 not found');
      return;
    }

    console.log('📝 Found Test 2:', test.title);
    console.log('📝 Current listening answers:', test.answers.get('listening'));

    // Update the listening answers
    test.answers.set('listening', correctListeningAnswers);
    
    await test.save();
    
    console.log('✅ Updated listening answers for Test 2');
    console.log('📝 New listening answers:', test.answers.get('listening'));

    console.log('✅ Test 2 listening answers update completed successfully!');
  } catch (err) {
    console.error('❌ Error updating Test 2 listening answers:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateTest2ListeningAnswers(); 
// server/scripts/updateListeningAnswers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const updateListeningAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Correct listening answers from the mark scheme
    const correctListeningAnswers = [
      "69",           // 1
      "stream",       // 2
      "data",         // 3
      "map",          // 4
      "visitors",     // 5
      "sounds",       // 6
      "freedom",      // 7
      "skills",       // 8
      "4.95",         // 9
      "leaders",      // 10
      "B",            // 11
      "A",            // 12
      "B",            // 13
      "C",            // 14
      "A",            // 15
      "G",            // 16
      "C",            // 17
      "B",            // 18
      "D",            // 19
      "A",            // 20
      ["B", "D"],     // 21 (IN EITHER ORDER)
      ["B", "D"],     // 22 (IN EITHER ORDER)
      ["A", "E"],     // 23 (IN EITHER ORDER)
      ["A", "E"],     // 24 (IN EITHER ORDER)
      "D",            // 25
      "G",            // 26
      "C",            // 27
      "B",            // 28
      "F",            // 29
      "H",            // 30
      "walls",        // 31
      "son",          // 32
      "fuel",         // 33
      "oxygen",       // 34
      "rectangular",  // 35
      "lamps",        // 36
      "family",       // 37
      "winter",       // 38
      "soil",         // 39
      "rain"          // 40
    ];

    // Find Test 1 and update its listening answers
    const test = await Test.findOne({ title: 'Test 1' });
    
    if (!test) {
      console.log('❌ Test 1 not found');
      return;
    }

    console.log('📝 Found Test 1:', test.title);
    console.log('📝 Current listening answers:', test.answers.get('listening'));

    // Update the listening answers
    test.answers.set('listening', correctListeningAnswers);
    
    await test.save();
    
    console.log('✅ Updated listening answers for Test 1');
    console.log('📝 New listening answers:', test.answers.get('listening'));

    console.log('✅ Listening answers update completed successfully!');
  } catch (err) {
    console.error('❌ Error updating listening answers:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateListeningAnswers(); 
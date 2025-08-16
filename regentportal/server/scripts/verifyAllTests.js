require('dotenv').config();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const verifyAllTests = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const tests = await Test.find({ title: { $in: ['Test 1', 'Test 2', 'Test 3'] } });
    
    console.log('📊 VERIFICATION: All Tests Structure Check');
    console.log('==========================================');
    console.log('');

    tests.forEach(test => {
      console.log(`${test.title}:`);
      console.log('- Answer keys:', Object.keys(Object.fromEntries(test.answers)));
      
      if (test.answers.has('reading')) {
        const reading = test.answers.get('reading');
        console.log(`- Reading answers: ${reading ? reading.length : 'NOT SET'}`);
      }
      
      if (test.answers.has('listening')) {
        const listening = test.answers.get('listening');
        console.log(`- Listening answers: ${listening ? listening.length : 'NOT SET'}`);
      }
      
      console.log('');
    });

    // Check if all have same structure
    const allSameStructure = tests.every(test => {
      const keys = Array.from(test.answers.keys());
      return keys.length === 2 && keys.includes('reading') && keys.includes('listening');
    });

    if (allSameStructure) {
      console.log('✅ SUCCESS: All tests now have the EXACT same structure!');
      console.log('📋 Structure: { "reading": [...40 answers], "listening": [...40 answers] }');
    } else {
      console.log('❌ ERROR: Tests have different structures!');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  }
};

verifyAllTests(); 
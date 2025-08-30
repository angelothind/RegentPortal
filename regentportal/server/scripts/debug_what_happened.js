// server/scripts/debug_what_happened.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const debugWhatHappened = async () => {
  try {
    console.log('🔄 Starting debug...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Current database state:');
    
    const allTests = await Test.find({});
    console.log(`Total tests found: ${allTests.length}`);
    
    console.log('\n📋 All tests:');
    allTests.forEach((test, index) => {
      console.log(`${index + 1}. Title: "${test.title}" | BelongsTo: "${test.belongsTo}"`);
      
      if (test.answers && test.answers.size > 0) {
        for (const [testType, answers] of test.answers.entries()) {
          if (Array.isArray(answers)) {
            console.log(`   ${testType}: ${answers.length} questions`);
          }
        }
      }
    });

    // Check if there are any tests with similar names
    console.log('\n🔍 Looking for similar test names...');
    const similarTests = allTests.filter(t => 
      t.title.includes('Test') || t.belongsTo.includes('Book')
    );
    console.log(`Similar tests found: ${similarTests.length}`);

    // Check if there are any tests with Book17 in the belongsTo field
    const book17Tests = allTests.filter(t => 
      t.belongsTo && t.belongsTo.toString().includes('17')
    );
    console.log(`Tests with '17' in belongsTo: ${book17Tests.length}`);

    if (book17Tests.length > 0) {
      console.log('\n📋 Book17-like tests:');
      book17Tests.forEach((test, index) => {
        console.log(`${index + 1}. Title: "${test.title}" | BelongsTo: "${test.belongsTo}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the debug
debugWhatHappened(); 
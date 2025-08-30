// server/scripts/debug_test_titles.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const debugTestTitles = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find all tests and show their exact titles
    const allTests = await Test.find({});
    console.log(`📝 Found ${allTests.length} tests:`);
    
    allTests.forEach((test, index) => {
      console.log(`${index + 1}. Title: "${test.title}" | BelongsTo: "${test.belongsTo}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the debug
debugTestTitles(); 
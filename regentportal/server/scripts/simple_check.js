// server/scripts/simple_check.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const simpleCheck = async () => {
  try {
    console.log('🔄 Starting simple check...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Looking for Book17 Test1...');
    
    // Try different search approaches
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    console.log('Search 1 result:', test1 ? 'FOUND' : 'NOT FOUND');
    
    const test1Alt = await Test.findOne({ belongsTo: 'Book 17', title: 'Test 1' });
    console.log('Search 2 result:', test1Alt ? 'FOUND' : 'NOT FOUND');
    
    const allTests = await Test.find({});
    console.log(`Total tests found: ${allTests.length}`);
    
    const book17Tests = allTests.filter(t => t.belongsTo === 'Book 17');
    console.log(`Book17 tests found: ${book17Tests.length}`);
    
    book17Tests.forEach((test, index) => {
      console.log(`Book17 Test ${index + 1}: "${test.title}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the simple check
simpleCheck(); 
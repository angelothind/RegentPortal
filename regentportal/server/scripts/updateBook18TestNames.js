// server/scripts/updateBook18TestNames.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');

const updateBook18TestNames = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Find Book18
    const book18 = await Book.findOne({ name: 'Book 18' });
    if (!book18) {
      console.log('❌ Book18 not found');
      return;
    }
    
    console.log('📚 Found Book18:', book18.name);
    console.log('Current tests array:');
    book18.tests.forEach((test, index) => {
      console.log(`   ${index + 1}: testName="${test.testName}", testId.title="${test.testId.title}"`);
    });
    
    // Update the testName fields to match the individual test titles
    console.log('\n🔄 Updating Book18 test names...');
    for (let i = 0; i < book18.tests.length; i++) {
      const test = book18.tests[i];
      const newTestName = `Test ${i + 1}`;
      
      if (test.testName !== newTestName) {
        console.log(`   Updating: "${test.testName}" → "${newTestName}"`);
        book18.tests[i].testName = newTestName;
      } else {
        console.log(`   ✓ Already correct: "${test.testName}"`);
      }
    }
    
    // Save the updated Book18
    await book18.save();
    console.log('✅ Book18 updated successfully');
    
    // Verify the changes
    console.log('\n📊 Final verification:');
    const updatedBook18 = await Book.findOne({ name: 'Book 18' });
    updatedBook18.tests.forEach((test, index) => {
      console.log(`   ${index + 1}: testName="${test.testName}", testId.title="${test.testId.title}"`);
    });
    
    console.log('\n🎉 Book18 test names updated successfully!');
    console.log('🎯 Frontend should now show clean test names');
    
  } catch (err) {
    console.error('❌ Error updating Book18 test names:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

updateBook18TestNames(); 
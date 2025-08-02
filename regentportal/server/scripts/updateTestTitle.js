// scripts/updateTestTitle.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const updateTestTitle = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find the existing test
    const existingTest = await Test.findOne({ title: 'Book19 - Test 1' });
    
    if (!existingTest) {
      console.log('❌ Test not found');
      return;
    }

    console.log(`🔄 Updating test: "${existingTest.title}"`);

    // Update the test title
    const updatedTest = await Test.findByIdAndUpdate(
      existingTest._id,
      {
        $set: {
          title: 'Test 1'
        }
      },
      { new: true }
    );

    console.log('✅ Test title updated successfully!');
    console.log(`📝 New title: "${updatedTest.title}"`);
    
  } catch (err) {
    console.error('❌ Error updating test title:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateTestTitle(); 
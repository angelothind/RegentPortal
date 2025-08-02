// scripts/checkTestData.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const checkTestData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find the test
    const test = await Test.findOne({ title: 'Test 1' });
    
    if (!test) {
      console.log('❌ Test not found');
      return;
    }

    console.log(`📋 Test found: "${test.title}"`);
    console.log(`🆔 Test ID: ${test._id}`);
    console.log(`📊 Sources count: ${test.sources.length}`);
    
    console.log('\n📁 Sources:');
    test.sources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source.name} (${source.sourceType}) - ${source.contentPath}`);
    });

    // Check if it has listening sources
    const hasListeningSources = test.sources.some(source => 
      source.contentPath.endsWith('.mp3')
    );
    const testType = hasListeningSources ? 'Listening' : 'Reading';
    
    console.log(`\n🎯 Detected test type: ${testType}`);
    console.log(`🔍 Has MP3 sources: ${hasListeningSources}`);

  } catch (err) {
    console.error('❌ Error checking test data:', err);
  } finally {
    mongoose.connection.close();
  }
};

checkTestData(); 
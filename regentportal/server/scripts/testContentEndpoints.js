// server/scripts/testContentEndpoints.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const testContentEndpoints = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all tests
    const tests = await Test.find({});
    console.log(`📊 Found ${tests.length} tests in database`);
    
    if (tests.length === 0) {
      console.log('❌ No tests found in database');
      return;
    }

    // Test the first test
    const test = tests[0];
    console.log(`\n🔍 Testing test: ${test.title} (ID: ${test._id})`);
    console.log(`📋 Test sources:`, test.sources);

    // Check if source files exist
    for (const source of test.sources) {
      const fs = require('fs');
      const path = require('path');
      
      // Add 'assets/' prefix since database stores paths without it
      const filePath = `assets/${source.contentPath}`;
      const absolutePath = path.join(__dirname, '..', filePath);
      
      const fileExists = fs.existsSync(absolutePath);
      console.log(`   📁 ${source.name} (${source.contentPath}): ${fileExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
      
      if (fileExists && source.contentPath.endsWith('.json')) {
        try {
          const rawContent = fs.readFileSync(absolutePath, 'utf-8');
          const content = JSON.parse(rawContent);
          console.log(`      📄 Content loaded successfully (${Object.keys(content).length} keys)`);
        } catch (err) {
          console.log(`      ❌ Error reading content: ${err.message}`);
        }
      }
    }

    console.log('\n🎯 Test content endpoints should work if all source files exist');

  } catch (err) {
    console.error('❌ Error testing content endpoints:', err);
  } finally {
    mongoose.connection.close();
  }
};

testContentEndpoints(); 
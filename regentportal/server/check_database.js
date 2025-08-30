const mongoose = require('mongoose');
const Test = require('./models/Test');
require('dotenv').config();

// Use environment variable with fallback for local development
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/regentportal';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('📝 Connected to database');
    console.log(`📝 Using MongoDB URI: ${mongoURI.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`);
    
    const tests = await Test.find({});
    console.log(`📝 Found ${tests.length} tests in database`);
    
    tests.forEach(test => {
      console.log(`\n📝 Test: ${test.title} (${test.belongsTo})`);
      console.log(`  - hasAnswers: ${!!test.answers}`);
      console.log(`  - answersSize: ${test.answers ? test.answers.size : 0}`);
      console.log(`  - answers field type: ${typeof test.answers}`);
      
      if (test.answers && test.answers.size > 0) {
        console.log(`  - Available types: ${Array.from(test.answers.keys()).join(', ')}`);
        
        // Show sample answers for each type
        Array.from(test.answers.entries()).forEach(([testType, answers]) => {
          console.log(`    ${testType}: ${typeof answers} with ${Array.isArray(answers) ? answers.length : Object.keys(answers).length} items`);
          if (typeof answers === 'object' && !Array.isArray(answers)) {
            console.log(`      Sample keys: ${Object.keys(answers).slice(0, 5).join(', ')}...`);
          }
        });
      } else {
        console.log(`  ❌ NO ANSWERS/MARKSCHEMES FOUND!`);
      }
    });
    
    // Check specifically for Book19 Test 1
    console.log('\n🔍 Checking Book19 Test 1 specifically:');
    const book19Test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    if (book19Test1) {
      console.log(`✅ Found Book19 Test 1`);
      console.log(`  - hasAnswers: ${!!book19Test1.answers}`);
      console.log(`  - answersSize: ${book19Test1.answers ? book19Test1.answers.size : 0}`);
      if (book19Test1.answers && book19Test1.answers.size > 0) {
        console.log(`  - Available types: ${Array.from(book19Test1.answers.keys()).join(', ')}`);
        Array.from(book19Test1.answers.entries()).forEach(([testType, answers]) => {
          console.log(`    ${testType}: ${typeof answers} with ${Array.isArray(answers) ? answers.length : Object.keys(answers).length} items`);
        });
      }
    } else {
      console.log(`❌ Book19 Test 1 not found`);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  }); 
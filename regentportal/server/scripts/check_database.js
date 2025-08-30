const mongoose = require('mongoose');
const Test = require('../models/Test');
require('dotenv').config({ path: __dirname + '/../.env' });

// Use the same connection logic as the main app
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const checkDatabase = async () => {
  try {
    await connectDB();
    
    const tests = await Test.find({});
    console.log(`📝 Found ${tests.length} tests in database`);
    
    tests.forEach(test => {
      console.log(`\n📝 Test: ${test.title} (${test.belongsTo})`);
      console.log(`  - hasAnswers: ${!!test.answers}`);
      console.log(`  - answersSize: ${test.answers ? test.answers.size : 0}`);
      
      if (test.answers && test.answers.size > 0) {
        console.log(`  - Available types: ${Array.from(test.answers.keys()).join(', ')}`);
        
        // Show sample answers for each type
        Array.from(test.answers.entries()).forEach(([testType, answers]) => {
          console.log(`    ${testType}: ${typeof answers} with ${Array.isArray(answers) ? answers.length : Object.keys(answers).length} items`);
        });
      }
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  }
};

checkDatabase(); 
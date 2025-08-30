const mongoose = require('mongoose');
const Test = require('./models/Test');

mongoose.connect('mongodb://localhost:27017/regentportal')
  .then(async () => {
    console.log('📝 Connected to database');
    
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
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  }); 
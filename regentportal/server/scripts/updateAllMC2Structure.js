// server/scripts/updateAllMC2Structure.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const updateAllMC2Structure = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find all tests
    const allTests = await Test.find({});
    console.log(`📝 Found ${allTests.length} tests to update`);

    for (const test of allTests) {
      console.log(`\n🔄 Processing ${test.title} (${test.belongsTo})...`);
      
      if (!test.answers || test.answers.size === 0) {
        console.log(`⚠️ No answers found for ${test.title}, skipping...`);
        continue;
      }

      let updated = false;
      const newAnswers = new Map();

      // Process each test type (listening, reading)
      for (const [testType, answers] of test.answers.entries()) {
        console.log(`📝 Processing ${testType} answers...`);
        
        if (Array.isArray(answers)) {
          // Convert array format to new structure
          const newAnswersArray = [];
          
          for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            
            if (Array.isArray(answer)) {
              // This is an MC2 answer that needs to be duplicated
              // Find the next question number that should also get this answer
              let nextIndex = i + 1;
              let nextAnswer = answers[nextIndex];
              
              if (nextAnswer && Array.isArray(nextAnswer) && JSON.stringify(answer) === JSON.stringify(nextAnswer)) {
                // This is already in the new format, keep as is
                newAnswersArray.push(answer);
                newAnswersArray.push(answer); // Duplicate for the second question
                i++; // Skip the next answer since we've already processed it
                console.log(`✅ Questions ${i}-${i+1}: MC2 with answers [${answer.join(', ')}]`);
              } else {
                // This needs to be converted to new format
                newAnswersArray.push(answer); // First question
                newAnswersArray.push(answer); // Second question (duplicate)
                console.log(`🔄 Converting questions ${i+1}-${i+2}: MC2 with answers [${answer.join(', ')}]`);
              }
            } else {
              // Single answer question, keep as is
              newAnswersArray.push(answer);
            }
          }
          
          newAnswers.set(testType, newAnswersArray);
          updated = true;
          console.log(`✅ Updated ${testType} answers: ${newAnswersArray.length} total`);
        } else {
          // Already in object format, keep as is
          newAnswers.set(testType, answers);
        }
      }

      if (updated) {
        // Update the test
        test.answers = newAnswers;
        await test.save();
        console.log(`✅ Successfully updated ${test.title}`);
      } else {
        console.log(`ℹ️ No updates needed for ${test.title}`);
      }
    }

    console.log('\n🎉 All tests updated successfully!');
    
    // Verify the updates
    console.log('\n📊 Verification:');
    const updatedTests = await Test.find({});
    for (const test of updatedTests) {
      if (test.answers && test.answers.size > 0) {
        console.log(`\n${test.title} (${test.belongsTo}):`);
        for (const [testType, answers] of test.answers.entries()) {
          if (Array.isArray(answers)) {
            console.log(`  ${testType}: ${answers.length} answers`);
            // Show MC2 examples
            const mc2Examples = answers
              .map((answer, index) => ({ answer, index: index + 1 }))
              .filter(item => Array.isArray(item.answer))
              .slice(0, 3);
            if (mc2Examples.length > 0) {
              console.log(`    MC2 examples: ${mc2Examples.map(item => `Q${item.index}: [${item.answer.join(', ')}]`).join(', ')}`);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error updating MC2 structure:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the update
updateAllMC2Structure(); 
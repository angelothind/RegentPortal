// server/scripts/fixMC2StructureCorrectly.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const fixMC2StructureCorrectly = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Fixing MC2 structure correctly...');
    console.log('🎯 Only duplicating MC2 questions, leaving optional answers alone!');

    // Find all tests
    const allTests = await Test.find({});
    console.log(`📝 Found ${allTests.length} tests to fix`);

    for (const test of allTests) {
      console.log(`\n🔄 Processing ${test.title} (${test.belongsTo})...`);
      
      if (!test.answers || test.answers.size === 0) {
        console.log(`⚠️ No answers found, skipping...`);
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
          let i = 0;
          
          while (i < answers.length) {
            const answer = answers[i];
            
            if (Array.isArray(answer)) {
              // Check if this is an MC2 question or an optional/substitute answer
              const isMC2Question = isMC2Answer(answer, i, answers);
              
              if (isMC2Question) {
                // This is an MC2 question - duplicate it for the next question
                newAnswersArray.push(answer); // First question
                newAnswersArray.push(answer); // Second question (duplicate)
                console.log(`✅ MC2: Q${i+1}-${i+2} with answers [${answer.join(', ')}]`);
                i++; // Skip the next answer since we've already processed it
              } else {
                // This is an optional/substitute answer - keep as single array
                newAnswersArray.push(answer);
                console.log(`ℹ️ Optional: Q${i+1} with answers [${answer.join(', ')}]`);
              }
            } else {
              // Single answer question, keep as is
              newAnswersArray.push(answer);
            }
            i++;
          }
          
          newAnswers.set(testType, newAnswersArray);
          updated = true;
          console.log(`✅ Updated ${testType}: ${newAnswersArray.length} questions`);
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

    console.log('\n🎉 All tests fixed successfully!');
    
    // Verify the updates
    console.log('\n📊 Verification:');
    const updatedTests = await Test.find({});
    for (const test of updatedTests) {
      if (test.answers && test.answers.size > 0) {
        console.log(`\n${test.title} (${test.belongsTo}):`);
        for (const [testType, answers] of test.answers.entries()) {
          if (Array.isArray(answers)) {
            console.log(`  ${testType}: ${answers.length} questions`);
            // Show examples
            const mc2Examples = answers
              .map((answer, index) => ({ answer, index: index + 1 }))
              .filter(item => Array.isArray(item.answer))
              .slice(0, 3);
            if (mc2Examples.length > 0) {
              console.log(`    Examples: ${mc2Examples.map(item => `Q${item.index}: [${item.answer.join(', ')}]`).join(', ')}`);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error fixing MC2 structure:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Helper function to determine if an array answer is MC2 or optional/substitute
const isMC2Answer = (answer, index, allAnswers) => {
  // MC2 questions typically have 2-4 letter/number options like ["A", "D"], ["B", "C"]
  // Optional/substitute answers typically have longer text options like ["35", "thirty five"]
  
  if (answer.length < 2 || answer.length > 4) {
    return false; // Too few or too many options for MC2
  }
  
  // Check if all elements are single letters (A-Z) or single numbers (0-9)
  const allSingleChars = answer.every(item => 
    typeof item === 'string' && 
    (item.length === 1) && 
    ((item >= 'A' && item <= 'Z') || (item >= '0' && item <= '9'))
  );
  
  if (allSingleChars) {
    return true; // This looks like MC2 (e.g., ["A", "D"])
  }
  
  // Check if it's likely an optional/substitute answer
  const hasLongText = answer.some(item => 
    typeof item === 'string' && item.length > 2
  );
  
  if (hasLongText) {
    return false; // This is likely optional/substitute (e.g., ["35", "thirty five"])
  }
  
  // Default to MC2 if unsure
  return true;
};

// Run the fix
fixMC2StructureCorrectly(); 
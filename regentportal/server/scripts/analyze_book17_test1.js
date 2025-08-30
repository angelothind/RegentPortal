// server/scripts/analyze_book17_test1.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const analyzeBook17Test1 = async () => {
  try {
    console.log('🔄 Starting Book17 Test1 analysis...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Looking for Book17 Test1...');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (!test1) {
      console.log('❌ Book17 Test1 not found!');
      return;
    }

    console.log('✅ Found Book17 Test1!');
    console.log('\n📋 BOOK17 TEST1 LISTENING ANALYSIS:');
    console.log('=====================================');

    if (test1.answers && test1.answers.has('listening')) {
      const listeningAnswers = test1.answers.get('listening');
      console.log(`📊 Total listening questions: ${listeningAnswers.length}`);
      
      console.log('\n🔍 DETAILED BREAKDOWN:');
      console.log('----------------------');
      
      listeningAnswers.forEach((answer, index) => {
        const questionNumber = index + 1;
        if (Array.isArray(answer)) {
          console.log(`Q${questionNumber}: [${answer.join(', ')}] (ARRAY - ${answer.length} options)`);
        } else {
          console.log(`Q${questionNumber}: "${answer}" (SINGLE)`);
        }
      });

      // Analyze the structure
      console.log('\n📊 STRUCTURE ANALYSIS:');
      console.log('----------------------');
      
      let singleAnswers = 0;
      let arrayAnswers = 0;
      let mc2Candidates = 0;
      let optionalCandidates = 0;

      listeningAnswers.forEach((answer, index) => {
        if (Array.isArray(answer)) {
          arrayAnswers++;
          
          // Check if it looks like MC2
          if (answer.length === 2 && answer.every(item => 
            typeof item === 'string' && item.length === 1 && 
            ((item >= 'A' && item <= 'Z') || (item >= '0' && item <= '9'))
          )) {
            mc2Candidates++;
            console.log(`✅ Q${index + 1}: [${answer.join(', ')}] - LIKELY MC2`);
          } else {
            optionalCandidates++;
            console.log(`ℹ️ Q${index + 1}: [${answer.join(', ')}] - LIKELY OPTIONAL/SUBSTITUTE`);
          }
        } else {
          singleAnswers++;
        }
      });

      console.log(`\n📈 SUMMARY:`);
      console.log(`- Single answers: ${singleAnswers}`);
      console.log(`- Array answers: ${arrayAnswers}`);
      console.log(`- MC2 candidates: ${mc2Candidates}`);
      console.log(`- Optional/substitute candidates: ${optionalCandidates}`);
      console.log(`- Total questions: ${listeningAnswers.length}`);

      // Check what the original seeding script should have been
      console.log('\n🔍 COMPARISON WITH ORIGINAL:');
      console.log('----------------------------');
      console.log('Original Book17 Test1 Listening should have:');
      console.log('- Questions 1-9: Single answers');
      console.log('- Question 10: ["35", "thirty five"] (optional - NOT MC2)');
      console.log('- Questions 11-14: Single answers');
      console.log('- Questions 15-16: ["A", "D"] (MC2 - should be duplicated)');
      console.log('- Questions 17-18: ["B", "C"] (MC2 - should be duplicated)');
      console.log('- Questions 19-20: ["D", "E"] (MC2 - should be duplicated)');
      console.log('- Questions 21-40: Single answers');
      console.log('- TOTAL: 40 questions');

      // Calculate expected vs actual
      const expectedQuestions = 40;
      const actualQuestions = listeningAnswers.length;
      const difference = actualQuestions - expectedQuestions;
      
      console.log(`\n🎯 COMPARISON:`);
      console.log(`- Expected: ${expectedQuestions} questions`);
      console.log(`- Actual: ${actualQuestions} questions`);
      console.log(`- Difference: ${difference} questions`);
      
      if (difference > 0) {
        console.log(`❌ PROBLEM: ${difference} extra questions detected!`);
        console.log(`🔍 This suggests optional/substitute answers are being duplicated when they shouldn't be.`);
      } else if (difference === 0) {
        console.log(`✅ PERFECT: Question count matches expected!`);
      } else {
        console.log(`❌ PROBLEM: Missing ${Math.abs(difference)} questions!`);
      }

    } else {
      console.log('❌ No listening answers found!');
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the analysis
analyzeBook17Test1(); 
// server/scripts/test_mc2_marking.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const testMC2Marking = async () => {
  try {
    console.log('🔄 Testing MC2 marking logic...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Test Book19 Test1 Listening (should have MC2 at Q21-22 and Q23-24)
    console.log('\n🔍 Testing Book19 Test1 Listening...');
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (test1 && test1.answers && test1.answers.has('listening')) {
      const listeningAnswers = test1.answers.get('listening');
      console.log(`📊 Total listening questions: ${listeningAnswers.length}`);
      
      // Check MC2 questions
      console.log('\n🎯 MC2 Questions Analysis:');
      console.log('---------------------------');
      
      // Q21-22 should be [B, D]
      const q21 = listeningAnswers[20]; // index 20 = Q21
      const q22 = listeningAnswers[21]; // index 21 = Q22
      
      console.log(`Q21: ${JSON.stringify(q21)} (should be [B, D])`);
      console.log(`Q22: ${JSON.stringify(q22)} (should be [B, D])`);
      
      if (Array.isArray(q21) && Array.isArray(q22) && 
          q21.length === 2 && q22.length === 2 &&
          q21.includes('B') && q21.includes('D') &&
          q22.includes('B') && q22.includes('D')) {
        console.log('✅ Q21-22 MC2 structure is correct!');
      } else {
        console.log('❌ Q21-22 MC2 structure is incorrect!');
      }
      
      // Q23-24 should be [A, E]
      const q23 = listeningAnswers[22]; // index 22 = Q23
      const q24 = listeningAnswers[23]; // index 23 = Q24
      
      console.log(`Q23: ${JSON.stringify(q23)} (should be [A, E])`);
      console.log(`Q24: ${JSON.stringify(q24)} (should be [A, E])`);
      
      if (Array.isArray(q23) && Array.isArray(q24) && 
          q23.length === 2 && q24.length === 2 &&
          q23.includes('A') && q23.includes('E') &&
          q24.includes('A') && q24.includes('E')) {
        console.log('✅ Q23-24 MC2 structure is correct!');
      } else {
        console.log('❌ Q23-24 MC2 structure is incorrect!');
      }
    }

    // Test Book17 Test1 Listening (should have MC2 at Q16-17, Q18-19, Q20-21)
    console.log('\n🔍 Testing Book17 Test1 Listening...');
    const book17test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book17' });
    
    if (book17test1 && book17test1.answers && book17test1.answers.has('listening')) {
      const listeningAnswers = book17test1.answers.get('listening');
      console.log(`📊 Total listening questions: ${listeningAnswers.length}`);
      
      console.log('\n🎯 MC2 Questions Analysis:');
      console.log('---------------------------');
      
      // Q16-17 should be [A, D]
      const q16 = listeningAnswers[15]; // index 15 = Q16
      const q17 = listeningAnswers[16]; // index 16 = Q17
      
      console.log(`Q16: ${JSON.stringify(q16)} (should be [A, D])`);
      console.log(`Q17: ${JSON.stringify(q17)} (should be [A, D])`);
      
      if (Array.isArray(q16) && Array.isArray(q17) && 
          q16.length === 2 && q17.length === 2 &&
          q16.includes('A') && q16.includes('D') &&
          q17.includes('A') && q17.includes('D')) {
        console.log('✅ Q16-17 MC2 structure is correct!');
      } else {
        console.log('❌ Q16-17 MC2 structure is incorrect!');
      }
      
      // Q18-19 should be [B, C]
      const q18 = listeningAnswers[17]; // index 17 = Q18
      const q19 = listeningAnswers[18]; // index 18 = Q19
      
      console.log(`Q18: ${JSON.stringify(q18)} (should be [B, C])`);
      console.log(`Q19: ${JSON.stringify(q19)} (should be [B, C])`);
      
      if (Array.isArray(q18) && Array.isArray(q19) && 
          q18.length === 2 && q19.length === 2 &&
          q18.includes('B') && q18.includes('C') &&
          q19.includes('B') && q19.includes('C')) {
        console.log('✅ Q18-19 MC2 structure is correct!');
      } else {
        console.log('❌ Q18-19 MC2 structure is incorrect!');
      }
      
      // Q20 should be [D, E] (MC2), Q21 should be "A" (single)
      const q20 = listeningAnswers[19]; // index 19 = Q20
      const q21 = listeningAnswers[20]; // index 20 = Q21
      
      console.log(`Q20: ${JSON.stringify(q20)} (should be [D, E])`);
      console.log(`Q21: ${JSON.stringify(q21)} (should be "A")`);
      
      if (Array.isArray(q20) && q20.length === 2 &&
          q20.includes('D') && q20.includes('E') &&
          q21 === "A") {
        console.log('✅ Q20-21 structure is correct!');
      } else {
        console.log('❌ Q20-21 structure is incorrect!');
      }
    }

    // Test Book19 Test1 Reading (should have MC2 at Q20-21 and Q22-23)
    console.log('\n🔍 Testing Book19 Test1 Reading...');
    if (test1 && test1.answers && test1.answers.has('reading')) {
      const readingAnswers = test1.answers.get('reading');
      console.log(`📊 Total reading questions: ${readingAnswers.length}`);
      
      console.log('\n🎯 MC2 Questions Analysis:');
      console.log('---------------------------');
      
      // Q20-21 should be [B, D]
      const q20 = readingAnswers[19]; // index 19 = Q20
      const q21 = readingAnswers[20]; // index 20 = Q21
      
      console.log(`Q20: ${JSON.stringify(q20)} (should be [B, D])`);
      console.log(`Q21: ${JSON.stringify(q21)} (should be [B, D])`);
      
      if (Array.isArray(q20) && Array.isArray(q21) && 
          q20.length === 2 && q21.length === 2 &&
          q20.includes('B') && q20.includes('D') &&
          q21.includes('B') && q21.includes('D')) {
        console.log('✅ Q20-21 MC2 structure is correct!');
      } else {
        console.log('❌ Q20-21 MC2 structure is incorrect!');
      }
      
      // Q22-23 should be [C, E]
      const q22 = readingAnswers[21]; // index 21 = Q22
      const q23 = readingAnswers[22]; // index 22 = Q23
      
      console.log(`Q22: ${JSON.stringify(q22)} (should be [C, E])`);
      console.log(`Q23: ${JSON.stringify(q23)} (should be [C, E])`);
      
      if (Array.isArray(q22) && Array.isArray(q23) && 
          q22.length === 2 && q23.length === 2 &&
          q22.includes('C') && q22.includes('E') &&
          q23.includes('C') && q23.includes('E')) {
        console.log('✅ Q22-23 MC2 structure is correct!');
      } else {
        console.log('❌ Q22-23 MC2 structure is incorrect!');
      }
    }

    console.log('\n🎉 MC2 Structure Test Complete!');
    console.log('\n📋 SUMMARY:');
    console.log('- Book19 Test1 Listening: MC2 at Q21-22, Q23-24');
    console.log('- Book19 Test1 Reading: MC2 at Q20-21, Q22-23');
    console.log('- Book17 Test1 Listening: MC2 at Q15-16, Q17-18, Q19-20 (Q21+ are single choice)');
    console.log('\n✅ All MC2 questions should now have the correct structure for proper marking!');

  } catch (error) {
    console.error('❌ Error during MC2 marking test:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test
testMC2Marking(); 
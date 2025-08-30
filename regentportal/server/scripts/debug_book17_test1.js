// server/scripts/debug_book17_test1.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const debugBook17Test1 = async () => {
  try {
    console.log('🔄 Debugging Book17 Test1...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book17' });
    if (!test1) {
      console.log('❌ Book17 Test1 not found!');
      return;
    }

    console.log('✅ Found Book17 Test1!');
    
    if (test1.answers && test1.answers.has('listening')) {
      const listeningAnswers = test1.answers.get('listening');
      console.log(`📊 Total listening questions: ${listeningAnswers.length}`);
      
      console.log('\n🔍 DETAILED BREAKDOWN:');
      console.log('----------------------');
      
      // Show questions 15-22 (the MC2 range)
      for (let i = 14; i <= 21; i++) {
        const questionNumber = i + 1;
        const answer = listeningAnswers[i];
        if (Array.isArray(answer)) {
          console.log(`Q${questionNumber}: [${answer.join(', ')}] (ARRAY)`);
        } else {
          console.log(`Q${questionNumber}: "${answer}" (SINGLE)`);
        }
      }
      
      console.log('\n🎯 EXPECTED MC2 STRUCTURE:');
      console.log('---------------------------');
      console.log('Q15: [A, D] (MC2 for Q15-16)');
      console.log('Q16: [A, D] (MC2 for Q15-16)');
      console.log('Q17: [B, C] (MC2 for Q17-18)');
      console.log('Q18: [B, C] (MC2 for Q17-18)');
      console.log('Q19: [D, E] (MC2 for Q19-20)');
      console.log('Q20: [D, E] (MC2 for Q19-20)');
      
      console.log('\n🔍 ACTUAL STRUCTURE:');
      console.log('--------------------');
      console.log(`Q15: ${JSON.stringify(listeningAnswers[14])}`);
      console.log(`Q16: ${JSON.stringify(listeningAnswers[15])}`);
      console.log(`Q17: ${JSON.stringify(listeningAnswers[16])}`);
      console.log(`Q18: ${JSON.stringify(listeningAnswers[17])}`);
      console.log(`Q19: ${JSON.stringify(listeningAnswers[18])}`);
      console.log(`Q20: ${JSON.stringify(listeningAnswers[19])}`);
      console.log(`Q21: ${JSON.stringify(listeningAnswers[20])}`);
      console.log(`Q22: ${JSON.stringify(listeningAnswers[21])}`);
      
    } else {
      console.log('❌ No listening answers found!');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the debug
debugBook17Test1(); 
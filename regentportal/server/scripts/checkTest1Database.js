require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const checkTest1Database = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    
    if (!test1) {
      console.log('❌ Test 1 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 1 Book 18');
    
    if (test1.answers) {
      const listeningAnswers = test1.answers.get('listening') || [];
      const readingAnswers = test1.answers.get('reading') || [];
      
      console.log('\n🎵 Listening Answers (showing Q1-Q10):');
      for (let i = 0; i < Math.min(10, listeningAnswers.length); i++) {
        const answer = listeningAnswers[i];
        console.log(`Q${i + 1}: ${JSON.stringify(answer)} (type: ${typeof answer}, isArray: ${Array.isArray(answer)})`);
      }
      
      console.log('\n📖 Reading Answers (showing Q1-Q10):');
      for (let i = 0; i < Math.min(10, readingAnswers.length); i++) {
        const answer = readingAnswers[i];
        console.log(`Q${i + 1}: ${JSON.stringify(answer)} (type: ${typeof answer}, isArray: ${Array.isArray(answer)})`);
      }
      
      // Check specific questions mentioned
      console.log('\n🔍 Specific Questions Check:');
      console.log('Q2 Listening:', JSON.stringify(listeningAnswers[1]));
      console.log('Q24 Listening:', JSON.stringify(listeningAnswers[23]));
      console.log('Q3 Reading:', JSON.stringify(readingAnswers[2]));
      
    } else {
      console.log('❌ No answers found in database');
    }
    
  } catch (err) {
    console.error('❌ Error checking database:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

checkTest1Database(); 
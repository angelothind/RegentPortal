require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const checkTest2Database = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });

    if (!test2) {
      console.log('❌ Test 2 Book 18 not found');
      return;
    }

    console.log('📝 Found Test 2 Book 18');

    if (test2.answers) {
      const listeningAnswers = test2.answers.get('listening') || [];
      const readingAnswers = test2.answers.get('reading') || [];

      console.log('\n🎵 Listening Answers (showing key questions):');
      console.log('Q11-12 (either order):', JSON.stringify(listeningAnswers[10]), JSON.stringify(listeningAnswers[11]));
      console.log('Q13-14 (either order):', JSON.stringify(listeningAnswers[12]), JSON.stringify(listeningAnswers[13]));
      console.log('Q25-26 (either order):', JSON.stringify(listeningAnswers[24]), JSON.stringify(listeningAnswers[25]));
      console.log('Q36 (optional s):', JSON.stringify(listeningAnswers[35]));
      console.log('Q37 (optional s):', JSON.stringify(listeningAnswers[36]));

      console.log('\n📖 Reading Answers (showing Q1-Q10):');
      for (let i = 0; i < Math.min(10, readingAnswers.length); i++) {
        const answer = readingAnswers[i];
        console.log(`Q${i + 1}: ${JSON.stringify(answer)} (type: ${typeof answer}, isArray: ${Array.isArray(answer)})`);
      }

      // Check specific questions mentioned
      console.log('\n🔍 Specific Questions Check:');
      console.log('Q1 Listening:', JSON.stringify(listeningAnswers[0]));
      console.log('Q8 Listening:', JSON.stringify(listeningAnswers[7]));
      console.log('Q36 Listening:', JSON.stringify(listeningAnswers[35]));

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

checkTest2Database(); 
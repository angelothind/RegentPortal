require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const fixTest1OptionalAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    
    if (!test1) {
      console.log('❌ Test 1 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 1 Book 18, fixing optional answers...');
    
    // Get current answers
    let answersMap = test1.answers || new Map();
    let listeningAnswers = answersMap.get('listening') || [];
    let readingAnswers = answersMap.get('reading') || [];
    
    // Fix Q3 Reading: "(food) consumption" -> ["food consumption", "consumption"]
    readingAnswers[2] = ["food consumption", "consumption"];
    
    // Fix Q24 Listening: "B" -> "C" (from the markscheme)
    listeningAnswers[23] = "C";
    
    // Update the answers map
    answersMap.set('reading', readingAnswers);
    answersMap.set('listening', listeningAnswers);
    
    // Update the test
    test1.answers = answersMap;
    await test1.save();
    
    console.log('✅ Successfully fixed optional answers for Book 18 Test 1');
    
    // Verify the fixes
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const updatedListening = updatedTest.answers.get('listening') || [];
      const updatedReading = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log('Q3 Reading (fixed):', JSON.stringify(updatedReading[2]));
      console.log('Q24 Listening (fixed):', JSON.stringify(updatedListening[23]));
      console.log('Q2 Listening (already correct):', JSON.stringify(updatedListening[1]));
    }
    
  } catch (err) {
    console.error('❌ Error fixing optional answers:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

fixTest1OptionalAnswers(); 
// server/scripts/addBook17Test4ListeningMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test4ListeningMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 4 Book 17
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book 17' });
    if (!test4) {
      console.log('❌ Test 4 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 4 Book 17, adding listening markscheme...');

    // Listening Test 4 Answers (Questions 1-40) from the markscheme
    const test4ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      ["floor", "floors"],  // Q1: two acceptable formats
      "fridge",             // Q2
      "shirts",             // Q3
      "windows",            // Q4
      "balcony",            // Q5
      "electrician",        // Q6
      "dust",               // Q7
      "police",             // Q8
      "training",           // Q9
      "review",             // Q10

      // Part 2 (Questions 11-20): 10 answers
      "A",                  // Q11
      "A",                  // Q12
      "A",                  // Q13
      "C",                  // Q14
      "A",                  // Q15
      "C",                  // Q16
      "B",                  // Q17
      "C",                  // Q18
      "B",                  // Q19
      "A",                  // Q20

      // Part 3 (Questions 21-30): 10 answers
      ["C", "E"],           // Q21&22 IN EITHER ORDER
      ["C", "E"],           // Q21&22 IN EITHER ORDER
      ["A", "D"],           // Q23&24 IN EITHER ORDER
      ["A", "D"],           // Q23&24 IN EITHER ORDER
      "B",                  // Q25
      "F",                  // Q26
      "A",                  // Q27
      "D",                  // Q28
      "C",                  // Q29
      "G",                  // Q30

      // Part 4 (Questions 31-40): 10 answers
      "golden",             // Q31
      "healthy",            // Q32
      "climate",            // Q33
      ["rock", "rocks"],    // Q34: two acceptable formats
      "diameter",           // Q35
      "tube",               // Q36
      "fire",               // Q37
      "steam",              // Q38
      "cloudy",             // Q39
      ["litre", "liter"]    // Q40: two acceptable formats
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update listening
    let currentAnswers = test4.answers || new Map();
    currentAnswers.set('listening', test4ListeningAnswers);
    
    // Keep existing reading answers
    if (!currentAnswers.has('reading')) {
      currentAnswers.set('reading', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test4.answers = currentAnswers;
    await test4.save();

    console.log('✅ Successfully added listening markscheme for Book 17 Test 4');
    console.log(`🎵 Listening: ${test4ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book 17' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      console.log('\n📊 Verification:');
      console.log(`- Total listening answers: ${listeningAnswers.length}`);
      console.log(`- Part 1 (1-10): ${listeningAnswers.slice(0, 10).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      console.log(`- Part 2 (11-20): ${listeningAnswers.slice(10, 20).join(', ')}`);
      console.log(`- Part 3 (21-30): ${listeningAnswers.slice(20, 30).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      console.log(`- Part 4 (31-40): ${listeningAnswers.slice(30, 40).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      
      // Show multiple answer examples
      const multipleAnswers = [];
      listeningAnswers.forEach((answer, index) => {
        if (Array.isArray(answer)) {
          multipleAnswers.push(`Q${index + 1}: [${answer.join(', ')}]`);
        }
      });
      if (multipleAnswers.length > 0) {
        console.log(`\n🔄 Multiple Answer Questions:`);
        multipleAnswers.forEach(item => console.log(`  ${item}`));
      }
    }

  } catch (err) {
    console.error('❌ Error adding listening markscheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook17Test4ListeningMarkscheme(); 
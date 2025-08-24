// server/scripts/addBook17Test2ListeningMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test2ListeningMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 2 Book 17
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book 17' });
    if (!test2) {
      console.log('❌ Test 2 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 2 Book 17, adding listening markscheme...');

    // Listening Test 2 Answers (Questions 1-40) from the markscheme
    const test2ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "collecting",        // Q1
      "records",           // Q2
      "West",              // Q3
      "transport",         // Q4
      "art",               // Q5
      "hospital",          // Q6
      "garden",            // Q7
      "quiz",              // Q8
      "tickets",           // Q9
      "poster",            // Q10

      // Part 2 (Questions 11-20): 10 answers
      "B",                 // Q11
      "C",                 // Q12
      "C",                 // Q13
      "B",                 // Q14
      "D",                 // Q15
      "C",                 // Q16
      "G",                 // Q17
      "A",                 // Q18
      "E",                 // Q19
      "F",                 // Q20

      // Part 3 (Questions 21-30): 10 answers
      ["D", "E"],          // Q21&22 IN EITHER ORDER
      ["D", "E"],          // Q21&22 IN EITHER ORDER
      "D",                 // Q23
      "C",                 // Q24
      "A",                 // Q25
      "E",                 // Q26
      "F",                 // Q27
      "B",                 // Q28
      "C",                 // Q29
      "C",                 // Q30

      // Part 4 (Questions 31-40): 10 answers
      "321,000",           // Q31
      "vocabulary",        // Q32
      "podcast",           // Q33
      "smartphones",       // Q34
      "bilingual",         // Q35
      "playground",        // Q36
      "picture",           // Q37
      "grammar",           // Q38
      "identity",          // Q39
      "fluent"             // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update listening
    let currentAnswers = test2.answers || new Map();
    currentAnswers.set('listening', test2ListeningAnswers);
    
    // Keep existing reading answers
    if (!currentAnswers.has('reading')) {
      currentAnswers.set('reading', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test2.answers = currentAnswers;
    await test2.save();

    console.log('✅ Successfully added listening markscheme for Book 17 Test 2');
    console.log(`🎵 Listening: ${test2ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book 17' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      console.log('\n📊 Verification:');
      console.log(`- Total listening answers: ${listeningAnswers.length}`);
      console.log(`- Part 1 (1-10): ${listeningAnswers.slice(0, 10).join(', ')}`);
      console.log(`- Part 2 (11-20): ${listeningAnswers.slice(10, 20).join(', ')}`);
      console.log(`- Part 3 (21-30): ${listeningAnswers.slice(20, 30).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      console.log(`- Part 4 (31-40): ${listeningAnswers.slice(30, 40).join(', ')}`);
      
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

addBook17Test2ListeningMarkscheme(); 
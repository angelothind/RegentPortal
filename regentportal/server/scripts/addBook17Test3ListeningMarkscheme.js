// server/scripts/addBook17Test3ListeningMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test3ListeningMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 3 Book 17
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book 17' });
    if (!test3) {
      console.log('❌ Test 3 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 3 Book 17, adding listening markscheme...');

    // Listening Test 3 Answers (Questions 1-40) from the markscheme
    const test3ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "family",            // Q1
      "fit",               // Q2
      "hotels",            // Q3
      "Carrowniskey",      // Q4
      "week",              // Q5
      "bay",               // Q6
      "September",         // Q7
      ["19", "nineteen"],  // Q8: two acceptable formats
      ["30", "thirty"],    // Q9: two acceptable formats
      "boots",             // Q10

      // Part 2 (Questions 11-20): 10 answers
      ["B", "E"],          // Q11&12 IN EITHER ORDER
      ["B", "E"],          // Q11&12 IN EITHER ORDER
      "C",                 // Q13
      "C",                 // Q14
      "A",                 // Q15
      "E",                 // Q16
      "D",                 // Q17
      "G",                 // Q18
      "F",                 // Q19
      "C",                 // Q20

      // Part 3 (Questions 21-30): 10 answers
      "B",                 // Q21
      "A",                 // Q22
      "A",                 // Q23
      "B",                 // Q24
      "C",                 // Q25
      "A",                 // Q26
      "D",                 // Q27
      "B",                 // Q28
      "F",                 // Q29
      "H",                 // Q30

      // Part 4 (Questions 31-40): 10 answers
      "mud",               // Q31
      "feathers",          // Q32
      "shape",             // Q33
      "moon",              // Q34
      "neck",              // Q35
      "evidence",          // Q36
      "destinations",      // Q37
      "oceans",            // Q38
      "recovery",          // Q39
      "atlas"              // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update listening
    let currentAnswers = test3.answers || new Map();
    currentAnswers.set('listening', test3ListeningAnswers);
    
    // Keep existing reading answers
    if (!currentAnswers.has('reading')) {
      currentAnswers.set('reading', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test3.answers = currentAnswers;
    await test3.save();

    console.log('✅ Successfully added listening markscheme for Book 17 Test 3');
    console.log(`🎵 Listening: ${test3ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book 17' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      console.log('\n📊 Verification:');
      console.log(`- Total listening answers: ${listeningAnswers.length}`);
      console.log(`- Part 1 (1-10): ${listeningAnswers.slice(0, 10).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      console.log(`- Part 2 (11-20): ${listeningAnswers.slice(10, 20).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      console.log(`- Part 3 (21-30): ${listeningAnswers.slice(20, 30).join(', ')}`);
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

addBook17Test3ListeningMarkscheme(); 
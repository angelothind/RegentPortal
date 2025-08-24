// server/scripts/addBook17Test1ListeningMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test1ListeningMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1 Book 17
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (!test1) {
      console.log('❌ Test 1 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 1 Book 17, adding listening markscheme...');

    // Listening Test 1 Answers (Questions 1-40) from the markscheme
    const test1ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "litter",           // Q1
      "dogs",             // Q2
      "insects",          // Q3
      "butterflies",      // Q4
      "wall",             // Q5
      "island",           // Q6
      "boots",            // Q7
      "beginners",        // Q8
      "spoons",           // Q9
      ["35", "thirty five"], // Q10: two acceptable formats

      // Part 2 (Questions 11-20): 10 answers
      "A",                // Q11
      "C",                // Q12
      "B",                // Q13
      "B",                // Q14
      ["A", "D"],         // Q15&16 IN EITHER ORDER
      ["B", "C"],         // Q17&18 IN EITHER ORDER
      ["D", "E"],         // Q19&20 IN EITHER ORDER

      // Part 3 (Questions 21-30): 10 answers
      "A",                // Q21
      "B",                // Q22
      "B",                // Q23
      "A",                // Q24
      "C",                // Q25
      "C",                // Q26
      "A",                // Q27
      "E",                // Q28
      "F",                // Q29
      "C",                // Q30

      // Part 4 (Questions 31-40): 10 answers
      "puzzle",           // Q31
      "logic",            // Q32
      "confusion",        // Q33
      "meditation",       // Q34
      "stone",            // Q35
      "coins",            // Q36
      "tree",             // Q37
      "breathing",        // Q38
      "paper",            // Q39
      "anxiety"           // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update listening
    let currentAnswers = test1.answers || new Map();
    currentAnswers.set('listening', test1ListeningAnswers);
    
    // Keep existing reading answers
    if (!currentAnswers.has('reading')) {
      currentAnswers.set('reading', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test1.answers = currentAnswers;
    await test1.save();

    console.log('✅ Successfully added listening markscheme for Book 17 Test 1');
    console.log(`🎵 Listening: ${test1ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
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

addBook17Test1ListeningMarkscheme(); 
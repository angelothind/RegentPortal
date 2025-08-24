// server/scripts/addBook17Test2ReadingMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test2ReadingMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 2 Book 17
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book 17' });
    if (!test2) {
      console.log('❌ Test 2 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 2 Book 17, adding reading markscheme...');

    // Reading Test 2 Answers (Questions 1-40) from the markscheme
    const test2ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "rock",               // Q1
      "cave",               // Q2
      "clay",               // Q3
      "Essenes",            // Q4
      "Hebrew",             // Q5
      "NOT GIVEN",          // Q6
      "FALSE",              // Q7
      "TRUE",               // Q8
      "TRUE",               // Q9
      "FALSE",              // Q10
      "FALSE",              // Q11
      "TRUE",               // Q12
      "NOT GIVEN",          // Q13

      // Reading Passage 2 (Questions 14-26): 13 answers
      "C",                  // Q14
      "B",                  // Q15
      "E",                  // Q16
      "A",                  // Q17
      "C",                  // Q18
      "B",                  // Q19
      "D",                  // Q20
      "A",                  // Q21
      "C",                  // Q22
      "A",                  // Q23
      ["flavour", "flavor"], // Q24: two acceptable spellings
      "size",               // Q25
      "salt",               // Q26

      // Reading Passage 3 (Questions 27-40): 14 answers
      "D",                  // Q27
      "A",                  // Q28
      "A",                  // Q29
      "C",                  // Q30
      "A",                  // Q31
      "NO",                 // Q32
      "NOT GIVEN",          // Q33
      "YES",                // Q34
      "NO",                 // Q35
      "NOT GIVEN",          // Q36
      "F",                  // Q37
      "D",                  // Q38
      "E",                  // Q39
      "B"                   // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update reading
    let currentAnswers = test2.answers || new Map();
    currentAnswers.set('reading', test2ReadingAnswers);
    
    // Keep existing listening answers if they exist
    if (!currentAnswers.has('listening')) {
      currentAnswers.set('listening', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test2.answers = currentAnswers;
    await test2.save();

    console.log('✅ Successfully added reading markscheme for Book 17 Test 2');
    console.log(`📖 Reading: ${test2ReadingAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book 17' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      console.log('\n📊 Verification:');
      console.log(`- Total reading answers: ${readingAnswers.length}`);
      console.log(`- Passage 1 (1-13): ${readingAnswers.slice(0, 13).join(', ')}`);
      console.log(`- Passage 2 (14-26): ${readingAnswers.slice(13, 26).map(a => Array.isArray(a) ? `[${a.join(', ')}]` : a).join(', ')}`);
      console.log(`- Passage 3 (27-40): ${readingAnswers.slice(26, 40).join(', ')}`);
      
      // Show multiple answer examples
      const multipleAnswers = [];
      readingAnswers.forEach((answer, index) => {
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
    console.error('❌ Error adding reading markscheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook17Test2ReadingMarkscheme(); 
// server/scripts/addBook17Test3ReadingMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test3ReadingMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 3 Book 17
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book 17' });
    if (!test3) {
      console.log('❌ Test 3 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 3 Book 17, adding reading markscheme...');

    // Reading Test 3 Answers (Questions 1-40) from the markscheme
    const test3ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "carnivorous",        // Q1
      "scent",              // Q2
      "pouch",              // Q3
      "fossil",             // Q4
      "habitat",            // Q5
      "TRUE",               // Q6
      "FALSE",              // Q7
      "NOT GIVEN",          // Q8
      "FALSE",              // Q9
      "NOT GIVEN",          // Q10
      "FALSE",              // Q11
      "TRUE",               // Q12
      "NOT GIVEN",          // Q13

      // Reading Passage 2 (Questions 14-26): 13 answers
      "F",                  // Q14
      "G",                  // Q15
      "A",                  // Q16
      "H",                  // Q17
      "B",                  // Q18
      "E",                  // Q19
      "C",                  // Q20
      ["B", "C"],           // Q21&22 IN EITHER ORDER
      ["B", "C"],           // Q21&22 IN EITHER ORDER
      "solid",              // Q23
      ["orangutan", "Sumatran orangutan", "orang-utan", "Sumatran orang-utan"], // Q24: 4 acceptable answers
      "carbon stocks",      // Q25
      "biodiversity",       // Q26

      // Reading Passage 3 (Questions 27-40): 14 answers
      "D",                  // Q27
      "B",                  // Q28
      "C",                  // Q29
      "D",                  // Q30
      "C",                  // Q31
      "NO",                 // Q32
      "YES",                // Q33
      "NOT GIVEN",          // Q34
      "NO",                 // Q35
      "H",                  // Q36
      "D",                  // Q37
      "I",                  // Q38
      "B",                  // Q39
      "F"                   // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update reading
    let currentAnswers = test3.answers || new Map();
    currentAnswers.set('reading', test3ReadingAnswers);
    
    // Keep existing listening answers if they exist
    if (!currentAnswers.has('listening')) {
      currentAnswers.set('listening', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test3.answers = currentAnswers;
    await test3.save();

    console.log('✅ Successfully added reading markscheme for Book 17 Test 3');
    console.log(`📖 Reading: ${test3ReadingAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book 17' });
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

addBook17Test3ReadingMarkscheme(); 
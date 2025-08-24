// server/scripts/addBook17Test1ReadingMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test1ReadingMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1 Book 17
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (!test1) {
      console.log('❌ Test 1 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 1 Book 17, adding reading markscheme...');

    // Reading Test 1 Answers (Questions 1-40) from the markscheme
    const test1ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "population",         // Q1
      "suburbs",            // Q2
      "businessmen",        // Q3
      "funding",            // Q4
      "press",              // Q5
      "soil",               // Q6
      "FALSE",              // Q7
      "NOT GIVEN",          // Q8
      "TRUE",               // Q9
      "TRUE",               // Q10
      "FALSE",              // Q11
      "FALSE",              // Q12
      "NOT GIVEN",          // Q13

      // Reading Passage 2 (Questions 14-26): 13 answers
      "A",                  // Q14
      "F",                  // Q15
      "E",                  // Q16
      "D",                  // Q17
      "fortress",           // Q18
      "bullfights",         // Q19
      "opera",              // Q20
      "salt",               // Q21
      "shops",              // Q22
      ["C", "D"],           // Q23&24 IN EITHER ORDER
      ["C", "D"],           // Q23&24 IN EITHER ORDER
      ["B", "E"],           // Q25&26 IN EITHER ORDER
      ["B", "E"],           // Q25&26 IN EITHER ORDER

      // Reading Passage 3 (Questions 27-40): 14 answers
      "H",                  // Q27
      "J",                  // Q28
      "F",                  // Q29
      "B",                  // Q30
      "D",                  // Q31
      "NOT GIVEN",          // Q32
      "NO",                 // Q33
      "NO",                 // Q34
      "YES",                // Q35
      "B",                  // Q36
      "C",                  // Q37
      "A",                  // Q38
      "B",                  // Q39
      "D"                   // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update reading
    let currentAnswers = test1.answers || new Map();
    currentAnswers.set('reading', test1ReadingAnswers);
    
    // Keep existing listening answers if they exist
    if (!currentAnswers.has('listening')) {
      currentAnswers.set('listening', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test1.answers = currentAnswers;
    await test1.save();

    console.log('✅ Successfully added reading markscheme for Book 17 Test 1');
    console.log(`📖 Reading: ${test1ReadingAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
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

addBook17Test1ReadingMarkscheme(); 
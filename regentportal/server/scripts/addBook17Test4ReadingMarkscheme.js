// server/scripts/addBook17Test4ReadingMarkscheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook17Test4ReadingMarkscheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 4 Book 17
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book 17' });
    if (!test4) {
      console.log('❌ Test 4 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 4 Book 17, adding reading markscheme...');

    // Reading Test 4 Answers (Questions 1-40) from the markscheme
    const test4ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "FALSE",              // Q1
      "FALSE",              // Q2
      "NOT GIVEN",          // Q3
      "TRUE",               // Q4
      "NOT GIVEN",          // Q5
      "TRUE",               // Q6
      "droppings",          // Q7
      "coffee",             // Q8
      "mosquitoes",         // Q9
      "protein",            // Q10
      "unclean",            // Q11
      "culture",            // Q12
      "houses",             // Q13

      // Reading Passage 2 (Questions 14-26): 13 answers
      "E",                  // Q14
      "A",                  // Q15
      "D",                  // Q16
      "F",                  // Q17
      "C",                  // Q18
      "descendants",        // Q19
      "sermon",             // Q20
      "fine",               // Q21
      "innovation",         // Q22
      ["B", "E"],           // Q23&24 IN EITHER ORDER
      ["B", "E"],           // Q23&24 IN EITHER ORDER
      ["B", "D"],           // Q25&26 IN EITHER ORDER
      ["B", "D"],           // Q25&26 IN EITHER ORDER

      // Reading Passage 3 (Questions 27-40): 14 answers
      "D",                  // Q27
      "E",                  // Q28
      "F",                  // Q29
      "B",                  // Q30
      "H",                  // Q31
      "E",                  // Q32
      "FALSE",              // Q33
      "NOT GIVEN",          // Q34
      "NOT GIVEN",          // Q35
      "TRUE",               // Q36
      "memory",             // Q37
      "numbers",            // Q38
      "communication",      // Q39
      "visual"              // Q40
    ];

    // Note: Answer count verification removed as requested

    // Get current answers and update reading
    let currentAnswers = test4.answers || new Map();
    currentAnswers.set('reading', test4ReadingAnswers);
    
    // Keep existing listening answers if they exist
    if (!currentAnswers.has('listening')) {
      currentAnswers.set('listening', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test with markscheme
    test4.answers = currentAnswers;
    await test4.save();

    console.log('✅ Successfully added reading markscheme for Book 17 Test 4');
    console.log(`📖 Reading: ${test4ReadingAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book 17' });
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

addBook17Test4ReadingMarkscheme(); 
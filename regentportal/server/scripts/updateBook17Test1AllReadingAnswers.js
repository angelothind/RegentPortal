// server/scripts/updateBook17Test1AllReadingAnswers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const updateBook17Test1AllReadingAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1 Book 17
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (!test1) {
      console.log('❌ Test 1 Book 17 not found');
      return;
    }

    console.log('📝 Found Test 1 Book 17, updating all reading answers (1-40)...');

    // Complete Reading Test 1 Answers (Questions 1-40)
    const allReadingAnswers = [
      // PASSAGE 1: Questions 1-13 (London Underground)
      // Questions 1-7: TFNG
      "NOT GIVEN",    // Q1: Population growth faster than expected
      "FALSE",        // Q2: Royal Commission allowed railways
      "FALSE",        // Q3: Pearson was businessman in slums
      "FALSE",        // Q4: First proposal accepted
      "TRUE",         // Q5: Metropolitan Railway Company formed 1854
      "FALSE",        // Q6: Construction completed on schedule
      "TRUE",         // Q7: World's first underground railway
      
      // Questions 8-13: Choose-x-word
      "roads",        // Q8: beneath existing roads
      "cut",          // Q9: cut and cover technique
      "ten",          // Q10: ten metres wide
      "timber",       // Q11: timber beams
      "arch",         // Q12: brick arch
      "road",         // Q13: road above rebuilt

      // PASSAGE 2: Questions 14-26 (Stadiums)
      // Questions 14-19: Matching
      "D",            // Q14: examples of historic stadiums that changed function
      "G",            // Q15: description of why modern stadiums problematic
      "K",            // Q16: mention of stadiums generating renewable energy
      "I",            // Q17: reference to stadiums serving multiple purposes
      "F",            // Q18: example of stadium that became market place
      "B",            // Q19: criticism of construction costs
      
      // Questions 20-22: Multiple choice
      "B",            // Q20: What happened to amphitheatre of Arles
      "C",            // Q21: Main advantage of stadiums as power plants
      "B",            // Q22: Kaohsiung Stadium details
      
      // Questions 23-26: Choose-x-word summary
      "costs",        // Q23: high construction costs
      "restaurants",  // Q24: facilities like hotels and restaurants
      "surface",      // Q25: large surface areas for solar panels
      "carbon",       // Q26: reducing carbon emissions

      // PASSAGE 3: Questions 27-40 (To catch a king book review)
      // Questions 27-30: Multiple choice
      "A",            // Q27: Charles II's deal with Scots (reluctantly)
      "B",            // Q28: Why tell story to Pepys (to be remembered)
      "C",            // Q29: Opinion of Spencer as writer (engaging)
      "B",            // Q30: Main criticism (character analysis)
      
      // Questions 31-36: YSNG
      "NOT GIVEN",    // Q31: Escape most important event
      "NO",           // Q32: English welcomed Charles with Scots
      "YES",          // Q33: Charles enjoyed retelling story
      "NO",           // Q34: Wilmot's refusal understandable
      "YES",          // Q35: More background than previous books
      "NO",           // Q36: Depiction of later years accurate
      
      // Questions 37-40: Choose-x-word
      "walnut",       // Q37: walnut leaves for skin
      "chivalry",     // Q38: order of chivalry
      "cherubs",      // Q39: cherubs on ceiling
      "pacey"         // Q40: pacey writing style
    ];

    // Verify we have exactly 40 answers
    if (allReadingAnswers.length !== 40) {
      console.log(`❌ Error: Expected 40 answers, got ${allReadingAnswers.length}`);
      return;
    }

    // Get current answers and update reading
    let currentAnswers = test1.answers || new Map();
    currentAnswers.set('reading', allReadingAnswers);
    
    // Keep existing listening answers (placeholders)
    if (!currentAnswers.has('listening')) {
      currentAnswers.set('listening', Array(40).fill('PLACEHOLDER'));
    }

    // Update the test
    test1.answers = currentAnswers;
    await test1.save();

    console.log('✅ Successfully updated all reading answers for Book 17 Test 1');
    console.log(`📖 Updated ${allReadingAnswers.length} reading answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book 17' });
    if (updatedTest && updatedTest.answers) {
      const updatedReadingAnswers = updatedTest.answers.get('reading') || [];
      console.log('\n📊 Verification:');
      console.log(`- Total reading answers: ${updatedReadingAnswers.length}`);
      console.log(`- Passage 1 (1-13): ${updatedReadingAnswers.slice(0, 13).join(', ')}`);
      console.log(`- Passage 2 (14-26): ${updatedReadingAnswers.slice(13, 26).join(', ')}`);
      console.log(`- Passage 3 (27-40): ${updatedReadingAnswers.slice(26, 40).join(', ')}`);
    }

  } catch (err) {
    console.error('❌ Error updating reading answers:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

updateBook17Test1AllReadingAnswers(); 
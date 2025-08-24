require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest4Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
    
    if (!test4) {
      console.log('❌ Test 4 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 4 Book 18, reseeding Reading mark scheme...');
    
    // Reading Test 4 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test4ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "D",                            // Q1
      "C",                            // Q2
      "E",                            // Q3
      "B",                            // Q4
      "D",                            // Q5
      "energy",                       // Q6
      "food",                         // Q7
      "gardening",                    // Q8
      "obesity",                      // Q9
      ["C", "D"],                    // Q10 - Either order
      ["C", "D"],                    // Q11 - Either order
      ["A", "D"],                    // Q12 - Either order
      ["A", "D"],                    // Q13 - Either order
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "B",                            // Q14
      "C",                            // Q15
      "D",                            // Q16
      "C",                            // Q17
      "B",                            // Q18
      "A",                            // Q19
      "E",                            // Q20
      "B",                            // Q21
      "D",                            // Q22
      "YES",                          // Q23
      "NO",                           // Q24
      "NOT GIVEN",                    // Q25
      "YES",                          // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "YES",                          // Q27
      "NOT GIVEN",                    // Q28
      "NO",                           // Q29
      "NO",                           // Q30
      "I",                            // Q31
      "F",                            // Q32
      "A",                            // Q33
      "C",                            // Q34
      "H",                            // Q35
      "E",                            // Q36
      "B",                            // Q37
      "A",                            // Q38
      "D",                            // Q39
      "C"                             // Q40
    ];

    // Verify answer count
    if (test4ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test4ReadingAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Reading: ${test4ReadingAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test4.answers || new Map();
    
    // Update reading answers
    answersMap.set('reading', test4ReadingAnswers);
    
    // Update the test
    test4.answers = answersMap;
    await test4.save();
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 18 Test 4');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q6 (word answer):', JSON.stringify(readingAnswers[5]));
      console.log('Q10-11 (either order):', JSON.stringify(readingAnswers[9]), JSON.stringify(readingAnswers[10]));
      console.log('Q12-13 (either order):', JSON.stringify(readingAnswers[11]), JSON.stringify(readingAnswers[12]));
      console.log('Q23 (YSNG):', JSON.stringify(readingAnswers[22]));
      console.log('Q31 (letter answer):', JSON.stringify(readingAnswers[30]));
      
      // Show multiple answer examples
      const multipleAnswers = [];
      readingAnswers.forEach((answer, index) => {
        if (Array.isArray(answer)) {
          multipleAnswers.push(`Q${index + 1}: ${JSON.stringify(answer)}`);
        }
      });
      if (multipleAnswers.length > 0) {
        console.log(`\n🔄 Multiple Answer Questions:`);
        multipleAnswers.forEach(item => console.log(`  ${item}`));
      }
    }
    
  } catch (err) {
    console.error('❌ Error reseeding Reading mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

reseedTest4Reading(); 
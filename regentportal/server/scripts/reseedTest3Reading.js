require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest3Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    
    if (!test3) {
      console.log('❌ Test 3 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 3 Book 18, reseeding Reading mark scheme...');
    
    // Reading Test 3 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test3ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "G",                            // Q1
      "D",                            // Q2
      "C",                            // Q3
      "F",                            // Q4
      "architects",                   // Q5
      "moisture",                     // Q6
      "layers",                       // Q7
      "speed",                        // Q8
      "C",                            // Q9
      "A",                            // Q10
      "B",                            // Q11
      "D",                            // Q12
      "A",                            // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "3",                            // Q14 - was "iii"
      "8",                            // Q15 - was "viii"
      "6",                            // Q16 - was "vi"
      "5",                            // Q17 - was "v"
      "7",                            // Q18 - was "vii"
      "1",                            // Q19 - was "i"
      "4",                            // Q20 - was "iv"
      "A",                            // Q21
      "C",                            // Q22
      "B",                            // Q23
      "speed",                        // Q24
      ["fifty", "50"],                // Q25 - Two acceptable answers
      "strict",                       // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "B",                            // Q27
      "A",                            // Q28
      "C",                            // Q29
      "C",                            // Q30
      "H",                            // Q31
      "D",                            // Q32
      "F",                            // Q33
      "E",                            // Q34
      "B",                            // Q35
      "NO",                           // Q36
      "NOT GIVEN",                    // Q37
      "YES",                          // Q38
      "NO",                           // Q39
      "NOT GIVEN"                     // Q40
    ];

    // Verify answer count
    if (test3ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test3ReadingAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Reading: ${test3ReadingAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test3.answers || new Map();
    
    // Update reading answers
    answersMap.set('reading', test3ReadingAnswers);
    
    // Update the test
    test3.answers = answersMap;
    await test3.save();
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 18 Test 3');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q5 (word answer):', JSON.stringify(readingAnswers[4]));
      console.log('Q14 (Roman numeral):', JSON.stringify(readingAnswers[13]));
      console.log('Q25 (fifty/50):', JSON.stringify(readingAnswers[24]));
      console.log('Q36 (YSNG):', JSON.stringify(readingAnswers[35]));
      console.log('Q38 (YSNG):', JSON.stringify(readingAnswers[37]));
      
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

reseedTest3Reading(); 
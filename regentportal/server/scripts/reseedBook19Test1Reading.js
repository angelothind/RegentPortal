require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test1Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (!test1) {
      console.log('❌ Book 19 Test 1 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 1, reseeding Reading mark scheme...');
    
    // Book 19 Test 1 Reading Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test1ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "FALSE",                         // Q1
      "FALSE",                         // Q2
      "NOT GIVEN",                     // Q3
      "FALSE",                         // Q4
      "NOT GIVEN",                     // Q5
      "TRUE",                          // Q6
      "TRUE",                          // Q7
      "paint",                         // Q8
      "topspin",                       // Q9
      "training",                      // Q10
      ["intestines", "gut"],           // Q11 - Two acceptable answers
      "weights",                       // Q12
      "grips",                         // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "D",                             // Q14
      "G",                             // Q15
      "C",                             // Q16
      "A",                             // Q17
      "G",                             // Q18
      "B",                             // Q19
      ["B", "D"],                     // Q20 - Either order
      ["B", "D"],                     // Q21 - Either order
      ["C", "E"],                     // Q22 - Either order
      ["C", "E"],                     // Q23 - Either order
      "grain",                         // Q24
      "punishment",                    // Q25
      "ransom",                        // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "D",                             // Q27
      "A",                             // Q28
      "C",                             // Q29
      "D",                             // Q30
      "G",                             // Q31
      "J",                             // Q32
      "H",                             // Q33
      "B",                             // Q34
      "E",                             // Q35
      "C",                             // Q36
      "YES",                           // Q37
      "NOT GIVEN",                     // Q38
      "NO",                            // Q39
      "NOT GIVEN"                      // Q40
    ];

    // Verify answer count
    if (test1ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test1ReadingAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Reading: ${test1ReadingAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test1.answers || new Map();
    
    // Update reading answers
    answersMap.set('reading', test1ReadingAnswers);
    
    // Update the test
    test1.answers = answersMap;
    await test1.save();
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 19 Test 1');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (TFNG):', JSON.stringify(readingAnswers[0]));
      console.log('Q11 (intestines/gut):', JSON.stringify(readingAnswers[10]));
      console.log('Q20-21 (either order):', JSON.stringify(readingAnswers[19]), JSON.stringify(readingAnswers[20]));
      console.log('Q22-23 (either order):', JSON.stringify(readingAnswers[21]), JSON.stringify(readingAnswers[22]));
      console.log('Q37 (YSNG):', JSON.stringify(readingAnswers[36]));
      
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

reseedBook19Test1Reading(); 
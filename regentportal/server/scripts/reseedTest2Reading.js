require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest2Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });
    
    if (!test2) {
      console.log('❌ Test 2 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 2 Book 18, reseeding Reading mark scheme...');
    
    // Reading Test 2 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test2ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      ["deer antlers", "antlers"],     // Q1 - Optional "(deer)"
      ["timber posts", "posts"],       // Q2 - Optional "(timber)"
      "tree trunks",                   // Q3
      "oxen",                          // Q4
      "glaciers",                      // Q5
      "druids",                        // Q6
      "burial",                        // Q7
      "calendar",                      // Q8
      "TRUE",                          // Q9
      "FALSE",                         // Q10
      "FALSE",                         // Q11
      "TRUE",                          // Q12
      "NOT GIVEN",                     // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "C",                             // Q14
      "A",                             // Q15
      "B",                             // Q16
      "D",                             // Q17
      "C",                             // Q18
      "D",                             // Q19
      "YES",                           // Q20
      "NOT GIVEN",                     // Q21
      "NO",                            // Q22
      "YES",                           // Q23
      "C",                             // Q24
      "A",                             // Q25
      "E",                             // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "NOT GIVEN",                     // Q27
      "NOT GIVEN",                     // Q28
      "TRUE",                          // Q29
      "FALSE",                         // Q30
      "TRUE",                          // Q31
      "NOT GIVEN",                     // Q32
      "FALSE",                         // Q33
      "transport",                     // Q34
      "staircases",                    // Q35
      "engineering",                   // Q36
      "rule",                          // Q37
      "Roman",                         // Q38
      "Paris",                         // Q39
      "outwards"                       // Q40
    ];

    // Verify answer count
    if (test2ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test2ReadingAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Reading: ${test2ReadingAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test2.answers || new Map();
    
    // Update reading answers
    answersMap.set('reading', test2ReadingAnswers);
    
    // Update the test
    test2.answers = answersMap;
    await test2.save();
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 18 Test 2');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (optional deer):', JSON.stringify(readingAnswers[0]));
      console.log('Q2 (optional timber):', JSON.stringify(readingAnswers[1]));
      console.log('Q9 (TFNG):', JSON.stringify(readingAnswers[8]));
      console.log('Q20 (YSNG):', JSON.stringify(readingAnswers[19]));
      console.log('Q34 (word answer):', JSON.stringify(readingAnswers[33]));
      
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

reseedTest2Reading(); 
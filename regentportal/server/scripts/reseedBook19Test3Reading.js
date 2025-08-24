require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test3Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book19' });
    
    if (!test3) {
      console.log('❌ Book 19 Test 3 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 3, reseeding Reading mark scheme...');
    
    // Book 19 Test 3 Reading Answers (Questions 1-40) - Properly formatted
    const test3ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "FALSE",                           // Q1
      "FALSE",                           // Q2
      "TRUE",                            // Q3
      "NOT GIVEN",                       // Q4
      "TRUE",                            // Q5
      "NOT GIVEN",                       // Q6
      "FALSE",                           // Q7
      "caves",                           // Q8
      "stone",                           // Q9
      "bones",                           // Q10
      "beads",                           // Q11
      "pottery",                         // Q12
      "spices",                          // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "G",                               // Q14
      "A",                               // Q15
      "H",                               // Q16
      "B",                               // Q17
      "carbon",                          // Q18
      "fires",                           // Q19
      "biodiversity",                    // Q20
      "ditches",                         // Q21
      "subsidence",                      // Q22
      "A",                               // Q23
      "C",                               // Q24
      "D",                               // Q25
      "B",                               // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "D",                               // Q27
      "A",                               // Q28
      "C",                               // Q29
      "B",                               // Q30
      "C",                               // Q31
      "E",                               // Q32
      "F",                               // Q33
      "B",                               // Q34
      "NO",                              // Q35
      "YES",                             // Q36
      "NO",                              // Q37
      "NOT GIVEN",                       // Q38
      "NOT GIVEN",                       // Q39
      "YES"                              // Q40
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
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 19 Test 3');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (TFNG):', JSON.stringify(readingAnswers[0]));
      console.log('Q8 (word):', JSON.stringify(readingAnswers[7]));
      console.log('Q18 (word):', JSON.stringify(readingAnswers[17]));
      console.log('Q35 (YSNG):', JSON.stringify(readingAnswers[34]));
      console.log('Q40 (YSNG):', JSON.stringify(readingAnswers[39]));
      
      // Show TFNG and YSNG counts
      const tfngCount = readingAnswers.filter(answer => 
        answer === "TRUE" || answer === "FALSE" || answer === "NOT GIVEN"
      ).length;
      const ysngCount = readingAnswers.filter(answer => 
        answer === "YES" || answer === "NO" || answer === "NOT GIVEN"
      ).length;
      
      console.log(`\n📊 Question Type Counts:`);
      console.log(`- TFNG questions: ${tfngCount}`);
      console.log(`- YSNG questions: ${ysngCount}`);
    }
    
  } catch (err) {
    console.error('❌ Error reseeding Reading mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

reseedBook19Test3Reading(); 
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test2Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book19' });
    
    if (!test2) {
      console.log('❌ Book 19 Test 2 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 2, reseeding Reading mark scheme...');
    
    // Book 19 Test 2 Reading Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test2ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "piston",                         // Q1
      "coal",                           // Q2
      "workshops",                      // Q3
      ["labour", "labor"],              // Q4 - Two acceptable spellings
      "quality",                        // Q5
      ["railway", "railways"],          // Q6 - Two acceptable forms
      "sanitation",                     // Q7
      "NOT GIVEN",                      // Q8
      "FALSE",                          // Q9
      "NOT GIVEN",                      // Q10
      "TRUE",                           // Q11
      "TRUE",                           // Q12
      "NOT GIVEN",                      // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "D",                              // Q14
      "F",                              // Q15
      "A",                              // Q16
      "C",                              // Q17
      "F",                              // Q18
      "injury",                         // Q19
      "serves",                         // Q20
      "excitement",                     // Q21
      ["Visualisation", "Visualization"], // Q22 - Two acceptable spellings
      ["B", "D"],                       // Q23 - Either order
      ["B", "D"],                       // Q24 - Either order
      ["A", "E"],                       // Q25 - Either order
      ["A", "E"],                       // Q26 - Either order
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "H",                              // Q27
      "A",                              // Q28
      "C",                              // Q29
      "B",                              // Q30
      "J",                              // Q31
      "I",                              // Q32
      "YES",                            // Q33
      "NOT GIVEN",                      // Q34
      "YES",                            // Q35
      "NOT GIVEN",                      // Q36
      "NO",                             // Q37
      "C",                              // Q38
      "B",                              // Q39
      "D"                               // Q40
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
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 19 Test 2');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q4 (labour/labor):', JSON.stringify(readingAnswers[3]));
      console.log('Q6 (railway/railways):', JSON.stringify(readingAnswers[5]));
      console.log('Q22 (Visualisation/Visualization):', JSON.stringify(readingAnswers[21]));
      console.log('Q23-24 (either order):', JSON.stringify(readingAnswers[22]), JSON.stringify(readingAnswers[23]));
      console.log('Q25-26 (either order):', JSON.stringify(readingAnswers[24]), JSON.stringify(readingAnswers[25]));
      console.log('Q33 (YSNG):', JSON.stringify(readingAnswers[32]));
      
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

reseedBook19Test2Reading(); 
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest1Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    
    if (!test1) {
      console.log('❌ Test 1 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 1 Book 18, reseeding Reading mark scheme...');
    
    // Reading Test 1 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test1ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "lettuces",                     // Q1
      "1,000 kg",                     // Q2
      ["food consumption", "consumption"], // Q3 - Optional "(food)"
      "pesticides",                   // Q4
      "journeys",                     // Q5
      "producers",                    // Q6
      ["flavour", "flavor"],          // Q7 - Two acceptable spellings
      "TRUE",                         // Q8
      "NOT GIVEN",                    // Q9
      "FALSE",                        // Q10
      "TRUE",                         // Q11
      "FALSE",                        // Q12
      "NOT GIVEN",                    // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "B",                            // Q14
      "A",                            // Q15
      "C",                            // Q16
      "E",                            // Q17
      "B",                            // Q18
      "B",                            // Q19
      "C",                            // Q20
      "C",                            // Q21
      "fire",                         // Q22
      "nutrients",                    // Q23
      "cavities",                     // Q24
      "hawthorn",                     // Q25
      "rare",                         // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "C",                            // Q27
      "F",                            // Q28
      "A",                            // Q29
      "E",                            // Q30
      "B",                            // Q31
      "sustainability",               // Q32
      "fuel",                         // Q33
      "explosions",                   // Q34
      "bankrupt",                     // Q35
      "C",                            // Q36
      "D",                            // Q37
      "B",                            // Q38
      "D",                            // Q39
      "A"                             // Q40
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
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 18 Test 1');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q3 (optional food):', JSON.stringify(readingAnswers[2]));
      console.log('Q7 (spelling variations):', JSON.stringify(readingAnswers[6]));
      console.log('Q8 (TFNG):', JSON.stringify(readingAnswers[7]));
      console.log('Q22 (word answer):', JSON.stringify(readingAnswers[21]));
      console.log('Q32 (word answer):', JSON.stringify(readingAnswers[31]));
      
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

reseedTest1Reading(); 
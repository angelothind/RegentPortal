require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test4Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book19' });
    
    if (!test4) {
      console.log('❌ Book 19 Test 4 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 4, reseeding Reading mark scheme...');
    
    // Book 19 Test 4 Reading Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test4ReadingAnswers = [
      // Reading Passage 1 (Questions 1-13): 13 answers
      "FALSE",                           // Q1
      "TRUE",                            // Q2
      "FALSE",                           // Q3
      "NOT GIVEN",                       // Q4
      "FALSE",                           // Q5
      "TRUE",                            // Q6
      "colonies",                        // Q7
      "spring",                          // Q8
      "endangered",                      // Q9
      ["habitat", "habitats"],           // Q10 - Two acceptable forms
      "Europe",                          // Q11
      "southern",                        // Q12
      "diet",                            // Q13
      
      // Reading Passage 2 (Questions 14-26): 13 answers
      "C",                               // Q14
      "F",                               // Q15
      "E",                               // Q16
      "D",                               // Q17
      "D",                               // Q18
      "B",                               // Q19
      "A",                               // Q20
      "E",                               // Q21
      "B",                               // Q22
      "C",                               // Q23
      "waste",                           // Q24
      "machinery",                       // Q25
      "caution",                         // Q26
      
      // Reading Passage 3 (Questions 27-40): 14 answers
      "C",                               // Q27
      "C",                               // Q28
      "B",                               // Q29
      "A",                               // Q30
      "egalitarianism",                  // Q31
      "status",                          // Q32
      "hunting",                         // Q33
      "domineering",                     // Q34
      "autonomy",                        // Q35
      "NOT GIVEN",                       // Q36
      "NO",                              // Q37
      "YES",                             // Q38
      "NOT GIVEN",                       // Q39
      "NO"                               // Q40
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
    
    console.log('✅ Successfully reseeded Reading mark scheme for Book 19 Test 4');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const readingAnswers = updatedTest.answers.get('reading') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Reading answers: ${readingAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (TFNG):', JSON.stringify(readingAnswers[0]));
      console.log('Q7 (word):', JSON.stringify(readingAnswers[6]));
      console.log('Q10 (habitat/habitats):', JSON.stringify(readingAnswers[9]));
      console.log('Q14 (multiple choice):', JSON.stringify(readingAnswers[13]));
      console.log('Q31 (word):', JSON.stringify(readingAnswers[30]));
      console.log('Q36 (YSNG):', JSON.stringify(readingAnswers[35]));
      
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

reseedBook19Test4Reading(); 
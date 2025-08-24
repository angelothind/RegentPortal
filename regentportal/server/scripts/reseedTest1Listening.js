require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest1Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    
    if (!test1) {
      console.log('❌ Test 1 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 1 Book 18, reseeding Listening mark scheme...');
    
    // Listening Test 1 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test1ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "DW30 7YZ",                    // Q1
      ["24th April", "24 April"],    // Q2 - Optional "(th)"
      "dentist",                     // Q3
      "parking",                     // Q4
      "Claxby",                      // Q5
      "late",                        // Q6
      "evening",                     // Q7
      "supermarket",                 // Q8
      "pollution",                   // Q9
      "storage",                     // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      "C",                           // Q11
      "A",                           // Q12
      "A",                           // Q13
      ["B", "E"],                    // Q14 - Either order
      ["B", "E"],                    // Q15 - Either order
      "B",                           // Q16
      "G",                           // Q17
      "D",                           // Q18
      "A",                           // Q19
      "F",                           // Q20
      
      // Part 3 (Questions 21-30): 10 answers
      "A",                           // Q21
      "B",                           // Q22
      "A",                           // Q23
      "C",                           // Q24
      "B",                           // Q25
      "A",                           // Q26
      ["B", "E"],                    // Q27 - Either order
      ["B", "E"],                    // Q28 - Either order
      ["A", "C"],                    // Q29 - Either order
      ["A", "C"],                    // Q30 - Either order
      
      // Part 4 (Questions 31-40): 10 answers
      "fences",                      // Q31
      "family",                      // Q32
      "helicopters",                 // Q33
      "stress",                      // Q34
      "sides",                       // Q35
      "breathing",                   // Q36
      "feet",                        // Q37
      "employment",                  // Q38
      "weapons",                     // Q39
      "tourism"                      // Q40
    ];

    // Verify answer count
    if (test1ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test1ListeningAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Listening: ${test1ListeningAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test1.answers || new Map();
    
    // Update listening answers
    answersMap.set('listening', test1ListeningAnswers);
    
    // Update the test
    test1.answers = answersMap;
    await test1.save();
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 18 Test 1');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q2 (optional th):', JSON.stringify(listeningAnswers[1]));
      console.log('Q14-15 (either order):', JSON.stringify(listeningAnswers[13]), JSON.stringify(listeningAnswers[14]));
      console.log('Q24 (should be C):', JSON.stringify(listeningAnswers[23]));
      console.log('Q27-28 (either order):', JSON.stringify(listeningAnswers[26]), JSON.stringify(listeningAnswers[27]));
      console.log('Q29-30 (either order):', JSON.stringify(listeningAnswers[28]), JSON.stringify(listeningAnswers[29]));
      
      // Show multiple answer examples
      const multipleAnswers = [];
      listeningAnswers.forEach((answer, index) => {
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
    console.error('❌ Error reseeding Listening mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

reseedTest1Listening(); 
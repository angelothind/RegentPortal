require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test2Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book19' });
    
    if (!test2) {
      console.log('❌ Book 19 Test 2 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 2, reseeding Listening mark scheme...');
    
    // Book 19 Test 2 Listening Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test2ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "Mathieson",                     // Q1
      "beginners",                      // Q2
      "college",                        // Q3
      "New",                            // Q4
      ["11", "eleven"],                // Q5 - Two acceptable forms
      "instrument",                     // Q6
      "ear",                            // Q7
      "clapping",                       // Q8
      "recording",                      // Q9
      "alone",                          // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      "A",                              // Q11
      "B",                              // Q12
      "A",                              // Q13
      "B",                              // Q14
      "C",                              // Q15
      "A",                              // Q16
      ["C", "E"],                      // Q17 - Either order
      ["C", "E"],                      // Q18 - Either order
      ["A", "B"],                      // Q19 - Either order
      ["A", "B"],                      // Q20 - Either order
      
      // Part 3 (Questions 21-30): 10 answers
      "A",                              // Q21
      "B",                              // Q22
      "B",                              // Q23
      "B",                              // Q24
      "E",                              // Q25
      "B",                              // Q26
      "A",                              // Q27
      "C",                              // Q28
      "C",                              // Q29
      "A",                              // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "move",                           // Q31
      "short",                          // Q32
      "discs",                          // Q33
      "oxygen",                         // Q34
      "tube",                           // Q35
      "temperatures",                   // Q36
      "protein",                        // Q37
      "space",                          // Q38
      "seaweed",                        // Q39
      "endangered"                      // Q40
    ];

    // Verify answer count
    if (test2ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test2ListeningAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Listening: ${test2ListeningAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test2.answers || new Map();
    
    // Update listening answers
    answersMap.set('listening', test2ListeningAnswers);
    
    // Update the test
    test2.answers = answersMap;
    await test2.save();
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 19 Test 2');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q5 (11/eleven):', JSON.stringify(listeningAnswers[4]));
      console.log('Q17-18 (either order):', JSON.stringify(listeningAnswers[16]), JSON.stringify(listeningAnswers[17]));
      console.log('Q19-20 (either order):', JSON.stringify(listeningAnswers[18]), JSON.stringify(listeningAnswers[19]));
      console.log('Q1 (name):', JSON.stringify(listeningAnswers[0]));
      
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

reseedBook19Test2Listening(); 
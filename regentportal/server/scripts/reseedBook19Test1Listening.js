require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test1Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    
    if (!test1) {
      console.log('❌ Book 19 Test 1 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 1, reseeding Listening mark scheme...');
    
    // Book 19 Test 1 Listening Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test1ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      ["69", "sixty-nine"],           // Q1 - Two acceptable forms
      "stream",                        // Q2
      "data",                          // Q3
      "map",                           // Q4
      "visitors",                      // Q5
      "sounds",                        // Q6
      "freedom",                       // Q7
      "skills",                        // Q8
      "4.95",                          // Q9
      "leaders",                       // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      "B",                             // Q11
      "A",                             // Q12
      "B",                             // Q13
      "C",                             // Q14
      "A",                             // Q15
      "G",                             // Q16
      "C",                             // Q17
      "B",                             // Q18
      "D",                             // Q19
      "A",                             // Q20
      
      // Part 3 (Questions 21-30): 10 answers
      ["B", "D"],                     // Q21 - Either order
      ["B", "D"],                     // Q22 - Either order
      ["A", "E"],                     // Q23 - Either order
      ["A", "E"],                     // Q24 - Either order
      "D",                             // Q25
      "G",                             // Q26
      "C",                             // Q27
      "B",                             // Q28
      "F",                             // Q29
      "H",                             // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "walls",                         // Q31
      "son",                           // Q32
      "fuel",                          // Q33
      "oxygen",                        // Q34
      "rectangular",                   // Q35
      "lamps",                         // Q36
      "family",                        // Q37
      "winter",                        // Q38
      "soil",                          // Q39
      "rain"                           // Q40
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
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 19 Test 1');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (69/sixty-nine):', JSON.stringify(listeningAnswers[0]));
      console.log('Q21-22 (either order):', JSON.stringify(listeningAnswers[20]), JSON.stringify(listeningAnswers[21]));
      console.log('Q23-24 (either order):', JSON.stringify(listeningAnswers[22]), JSON.stringify(listeningAnswers[23]));
      console.log('Q9 (number):', JSON.stringify(listeningAnswers[8]));
      
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

reseedBook19Test1Listening(); 
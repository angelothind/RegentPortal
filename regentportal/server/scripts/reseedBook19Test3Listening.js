require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test3Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book19' });
    
    if (!test3) {
      console.log('❌ Book 19 Test 3 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 3, reseeding Listening mark scheme...');
    
    // Book 19 Test 3 Listening Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test3ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      ["harbour", "harbor"],            // Q1 - Two acceptable spellings
      "bridge",                          // Q2
      ["3.30", "three thirty", "½", "half 3", "three"], // Q3 - Multiple acceptable forms
      ["Rose", "rose"],                  // Q4 - Two acceptable forms
      "sign",                            // Q5
      "purple",                          // Q6
      "samphire",                        // Q7
      "melon",                           // Q8
      "coconut",                         // Q9
      "strawberry",                      // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      "C",                               // Q11
      "D",                               // Q12
      "F",                               // Q13
      "G",                               // Q14
      "B",                               // Q15
      "H",                               // Q16
      ["D", "E"],                        // Q17 - Either order
      ["D", "E"],                        // Q18 - Either order
      ["B", "C"],                        // Q19 - Either order
      ["B", "C"],                        // Q20 - Either order
      
      // Part 3 (Questions 21-30): 10 answers
      "C",                               // Q21
      "B",                               // Q22
      "A",                               // Q23
      "A",                               // Q24
      "C",                               // Q25
      "C",                               // Q26
      "H",                               // Q27
      "E",                               // Q28
      "B",                               // Q29
      "F",                               // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "clothing",                        // Q31
      "mouths",                          // Q32
      "salt",                            // Q33
      "toothpaste",                      // Q34
      ["fertilisers", "fertilizers"],    // Q35 - Two acceptable spellings
      "nutrients",                       // Q36
      "growth",                          // Q37
      "weight",                          // Q38
      "acid",                            // Q39
      "society"                          // Q40
    ];

    // Verify answer count
    if (test3ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test3ListeningAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Listening: ${test3ListeningAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test3.answers || new Map();
    
    // Update listening answers
    answersMap.set('listening', test3ListeningAnswers);
    
    // Update the test
    test3.answers = answersMap;
    await test3.save();
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 19 Test 3');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (harbour/harbor):', JSON.stringify(listeningAnswers[0]));
      console.log('Q3 (time formats):', JSON.stringify(listeningAnswers[2]));
      console.log('Q4 (Rose/rose):', JSON.stringify(listeningAnswers[3]));
      console.log('Q17-18 (either order):', JSON.stringify(listeningAnswers[16]), JSON.stringify(listeningAnswers[17]));
      console.log('Q19-20 (either order):', JSON.stringify(listeningAnswers[18]), JSON.stringify(listeningAnswers[19]));
      console.log('Q35 (fertilisers/fertilizers):', JSON.stringify(listeningAnswers[34]));
      
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

reseedBook19Test3Listening(); 
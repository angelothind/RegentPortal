require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedBook19Test4Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book19' });
    
    if (!test4) {
      console.log('❌ Book 19 Test 4 not found');
      return;
    }
    
    console.log('📝 Found Book 19 Test 4, reseeding Listening mark scheme...');
    
    // Book 19 Test 4 Listening Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test4ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "Kaeden",                         // Q1
      ["locker", "lockers"],            // Q2 - Two acceptable forms
      "passport",                       // Q3
      "uniform",                        // Q4
      ["third", "3rd"],                // Q5 - Two acceptable forms
      "0412 665 903",                  // Q6 - Phone number
      "yellow",                         // Q7
      "plastic",                        // Q8
      "ice",                            // Q9
      "gloves",                         // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      ["C", "E"],                       // Q11 - Either order
      ["C", "E"],                       // Q12 - Either order
      ["A", "D"],                       // Q13 - Either order
      ["A", "D"],                       // Q14 - Either order
      "A",                              // Q15
      "B",                              // Q16
      "C",                              // Q17
      "A",                              // Q18
      "C",                              // Q19
      "B",                              // Q20
      
      // Part 3 (Questions 21-30): 10 answers
      "A",                              // Q21
      "C",                              // Q22
      "A",                              // Q23
      "B",                              // Q24
      "C",                              // Q25
      "D",                              // Q26
      "F",                              // Q27
      "A",                              // Q28
      "C",                              // Q29
      "G",                              // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "competition",                    // Q31
      "food",                           // Q32
      "disease",                        // Q33
      "agriculture",                    // Q34
      "maps",                           // Q35
      "cattle",                         // Q36
      "speed",                          // Q37
      "monkeys",                        // Q38
      "fishing",                        // Q39
      "flooding"                        // Q40
    ];

    // Verify answer count
    if (test4ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test4ListeningAnswers.length}, should be 40`);
      return;
    }
    
    console.log(`📊 Listening: ${test4ListeningAnswers.length} answers ready to seed`);
    
    // Get current answers map
    let answersMap = test4.answers || new Map();
    
    // Update listening answers
    answersMap.set('listening', test4ListeningAnswers);
    
    // Update the test
    test4.answers = answersMap;
    await test4.save();
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 19 Test 4');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book19' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q1 (name):', JSON.stringify(listeningAnswers[0]));
      console.log('Q2 (locker/lockers):', JSON.stringify(listeningAnswers[1]));
      console.log('Q5 (third/3rd):', JSON.stringify(listeningAnswers[4]));
      console.log('Q6 (phone):', JSON.stringify(listeningAnswers[5]));
      console.log('Q11-12 (either order):', JSON.stringify(listeningAnswers[10]), JSON.stringify(listeningAnswers[11]));
      console.log('Q13-14 (either order):', JSON.stringify(listeningAnswers[12]), JSON.stringify(listeningAnswers[13]));
      
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

reseedBook19Test4Listening(); 
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest3Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test3 = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    
    if (!test3) {
      console.log('❌ Test 3 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 3 Book 18, reseeding Listening mark scheme...');
    
    // Listening Test 3 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test3ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "Marrowfield",                  // Q1
      "relative",                     // Q2
      ["socialise", "socialize"],     // Q3 - Two acceptable spellings
      "full",                         // Q4
      "Domestic Life",                // Q5
      "clouds",                       // Q6
      "timing",                       // Q7
      "Animal Magic",                 // Q8
      ["animal movement", "movement"], // Q9 - Optional "(animal)"
      "dark",                         // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      ["B", "C"],                    // Q11 - Either order
      ["B", "C"],                    // Q12 - Either order
      ["B", "D"],                    // Q13 - Either order
      ["B", "D"],                    // Q14 - Either order
      "C",                           // Q15
      "B",                           // Q16
      "B",                           // Q17
      "C",                           // Q18
      "A",                           // Q19
      "A",                           // Q20
      
      // Part 3 (Questions 21-30): 10 answers
      ["A", "E"],                    // Q21 - Either order
      ["A", "E"],                    // Q22 - Either order
      ["B", "D"],                    // Q23 - Either order
      ["B", "D"],                    // Q24 - Either order
      "G",                           // Q25
      "E",                           // Q26
      "B",                           // Q27
      "C",                           // Q28
      "F",                           // Q29
      "A",                           // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "technical",                    // Q31
      "cheap",                        // Q32
      "thousands",                    // Q33
      "identification",               // Q34
      "tracking",                     // Q35
      "military",                     // Q36
      "location",                     // Q37
      "prediction",                   // Q38
      "database",                     // Q39
      "trust"                         // Q40
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
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 18 Test 3');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 3', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q3 (spelling variations):', JSON.stringify(listeningAnswers[2]));
      console.log('Q9 (optional animal):', JSON.stringify(listeningAnswers[8]));
      console.log('Q11-12 (either order):', JSON.stringify(listeningAnswers[10]), JSON.stringify(listeningAnswers[11]));
      console.log('Q13-14 (either order):', JSON.stringify(listeningAnswers[12]), JSON.stringify(listeningAnswers[13]));
      console.log('Q21-22 (either order):', JSON.stringify(listeningAnswers[20]), JSON.stringify(listeningAnswers[21]));
      console.log('Q23-24 (either order):', JSON.stringify(listeningAnswers[22]), JSON.stringify(listeningAnswers[23]));
      
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

reseedTest3Listening(); 
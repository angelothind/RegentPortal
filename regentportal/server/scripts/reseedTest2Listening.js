require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest2Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });
    
    if (!test2) {
      console.log('❌ Test 2 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 2 Book 18, reseeding Listening mark scheme...');
    
    // Listening Test 2 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test2ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "training",                     // Q1
      "discount",                     // Q2
      "taxi",                        // Q3
      "service",                      // Q4
      "English",                      // Q5
      "Wivenhoe",                     // Q6
      "equipment",                    // Q7
      "9.75",                        // Q8
      "deliveries",                   // Q9
      "Sunday",                       // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      ["B", "E"],                    // Q11 - Either order
      ["B", "E"],                    // Q12 - Either order
      ["B", "C"],                    // Q13 - Either order
      ["B", "C"],                    // Q14 - Either order
      "G",                           // Q15
      "C",                           // Q16
      "D",                           // Q17
      "B",                           // Q18
      "H",                           // Q19
      "A",                           // Q20
      
      // Part 3 (Questions 21-30): 10 answers
      "C",                           // Q21
      "A",                           // Q22
      "B",                           // Q23
      "B",                           // Q24
      ["A", "B"],                    // Q25 - Either order
      ["A", "B"],                    // Q26 - Either order
      "D",                           // Q27
      "A",                           // Q28
      "C",                           // Q29
      "F",                           // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "convenient",                   // Q31
      "suits",                        // Q32
      "tailor",                       // Q33
      "profession",                   // Q34
      "visible",                      // Q35
      ["string", "strings"],          // Q36 - Optional "s"
      ["waist", "waists"],            // Q37 - Optional "s"
      "perfume",                      // Q38
      "image",                        // Q39
      "handbag"                       // Q40
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
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 18 Test 2');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q11-12 (either order):', JSON.stringify(listeningAnswers[10]), JSON.stringify(listeningAnswers[11]));
      console.log('Q13-14 (either order):', JSON.stringify(listeningAnswers[12]), JSON.stringify(listeningAnswers[13]));
      console.log('Q25-26 (either order):', JSON.stringify(listeningAnswers[24]), JSON.stringify(listeningAnswers[25]));
      console.log('Q36 (optional s):', JSON.stringify(listeningAnswers[35]));
      console.log('Q37 (optional s):', JSON.stringify(listeningAnswers[36]));
      
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

reseedTest2Listening(); 
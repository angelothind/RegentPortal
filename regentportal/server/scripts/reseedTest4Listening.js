require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const reseedTest4Listening = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test4 = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
    
    if (!test4) {
      console.log('❌ Test 4 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 4 Book 18, reseeding Listening mark scheme...');
    
    // Listening Test 4 Answers (Questions 1-40) - Properly formatted with optional parts and arrays
    const test4ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "receptionist",                 // Q1
      "Medical",                      // Q2
      "Chastons",                     // Q3
      "appointments",                 // Q4
      "database",                     // Q5
      "experience",                   // Q6
      "confident",                    // Q7
      "temporary",                    // Q8
      "1.15",                         // Q9
      "parking",                      // Q10
      
      // Part 2 (Questions 11-20): 10 answers
      "B",                            // Q11
      "A",                            // Q12
      "A",                            // Q13
      "C",                            // Q14
      "F",                            // Q15
      "G",                            // Q16
      "E",                            // Q17
      "A",                            // Q18
      "C",                            // Q19
      "B",                            // Q20
      
      // Part 3 (Questions 21-30): 10 answers
      ["B", "D"],                    // Q21 - Either order
      ["B", "D"],                    // Q22 - Either order
      "D",                           // Q23
      "A",                           // Q24
      "C",                           // Q25
      "G",                           // Q26
      "F",                           // Q27
      "A",                           // Q28
      "B",                           // Q29
      "C",                           // Q30
      
      // Part 4 (Questions 31-40): 10 answers
      "plot",                         // Q31
      "poverty",                      // Q32
      "Europe",                       // Q33
      "poetry",                       // Q34
      "drawings",                     // Q35
      "furniture",                    // Q36
      "lamps",                        // Q37
      ["harbour", "harbor"],          // Q38 - Two acceptable spellings
      "children",                     // Q39
      "relatives"                     // Q40
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
    
    console.log('✅ Successfully reseeded Listening mark scheme for Book 18 Test 4');
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 4', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      const listeningAnswers = updatedTest.answers.get('listening') || [];
      
      console.log('\n📊 Verification:');
      console.log(`- Listening answers: ${listeningAnswers.length}`);
      
      // Show key answers including optional parts and arrays
      console.log('\n🔍 Key Answers Check:');
      console.log('Q21-22 (either order):', JSON.stringify(listeningAnswers[20]), JSON.stringify(listeningAnswers[21]));
      console.log('Q38 (spelling variations):', JSON.stringify(listeningAnswers[37]));
      
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

reseedTest4Listening(); 
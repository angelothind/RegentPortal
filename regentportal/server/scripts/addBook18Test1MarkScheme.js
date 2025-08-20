// server/scripts/addBook18Test1MarkScheme.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook18Test1MarkScheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 1 Book 18
    const test1 = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    if (!test1) {
      console.log('❌ Test 1 Book 18 not found');
      return;
    }

    console.log('📝 Found Test 1 Book 18, adding mark schemes...');

    // Reading Test 1 Answers (Questions 1-40) - From the mark scheme image
    const test1ReadingAnswers = [
        // Passage 1 (Questions 1-13): 13 answers
        "lettuces", "1,000 kg", "(food) consumption", "pesticides", "journeys", "producers", "flavour / flavor", "TRUE", "NOT GIVEN", "FALSE", "TRUE", "NOT GIVEN", "TRUE",
        
        // Passage 2 (Questions 14-26): 13 answers
        "B", "A", "C", "E", "B", "B", "C", "C", "fire", "nutrients", "cavities", "hawthorn", "rare",
        
        // Passage 3 (Questions 27-40): 14 answers
        "C", "F", "A", "E", "B", "sustainability", "fuel", "explosions", "bankrupt", "C", "D", "B", "D", "A"
    ];

    // Listening Test 1 Answers (Questions 1-40) - From the mark scheme image
    const test1ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "DW30 7YZ", "24(th) April", "dentist", "parking", "Claxby", "late", "evening", "supermarket", "pollution", "storage",
      
      // Part 2 (Questions 11-20): 10 answers (Q14&15 IN EITHER ORDER)
      "C", "A", "A", ["B", "E"], "B", "G", "D", "A", "F",
      
      // Part 3 (Questions 21-30): 10 answers (Q27&28 and Q29&30 IN EITHER ORDER)
      "A", "B", "A", "C", "B", "A", ["B", "E"], ["A", "C"],
      
      // Part 4 (Questions 31-40): 10 answers
      "fences", "family", "helicopters", "stress", "sides", "breathing", "feet", "employment", "weapons", "tourism"
    ];

    // Verify answer counts
    if (test1ReadingAnswers.length !== 40) {
      console.log(`❌ Error: Reading answers count is ${test1ReadingAnswers.length}, should be 40`);
      return;
    }
    
    // For listening, count actual questions (arrays count as 2 questions each)
    let listeningQuestionCount = 0;
    test1ListeningAnswers.forEach(answer => {
      if (Array.isArray(answer)) {
        listeningQuestionCount += 2; // Each array represents 2 questions
      } else {
        listeningQuestionCount += 1; // Single answers represent 1 question
      }
    });
    
    if (listeningQuestionCount !== 40) {
      console.log(`❌ Error: Listening questions count is ${listeningQuestionCount}, should be 40`);
      console.log(`Array elements: ${test1ListeningAnswers.length}, but represents ${listeningQuestionCount} questions`);
      return;
    }

    // Create answers map with proper question number mapping
    const answersMap = new Map();
    
    // Store answers directly as arrays (matching Book 19 format)
    answersMap.set('reading', test1ReadingAnswers);
    answersMap.set('listening', test1ListeningAnswers);

    // Update the test with mark schemes
    test1.answers = answersMap;
    await test1.save();

    console.log('✅ Successfully added mark schemes for Book 18 Test 1');
    console.log(`📖 Reading: ${test1ReadingAnswers.length} answers`);
    console.log(`🎵 Listening: ${test1ListeningAnswers.length} answers`);

    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 1', belongsTo: 'Book18' });
    if (updatedTest && updatedTest.answers) {
      console.log('\n📊 Verification:');
      console.log(`- Answer keys: ${updatedTest.answers.size}`);
      console.log(`- Reading answers: ${updatedTest.answers.get('reading') ? Object.keys(updatedTest.answers.get('reading')).length : 0}`);
      
      // Calculate actual listening question count
      const listeningAnswers = updatedTest.answers.get('listening') || {};
      let actualListeningQuestions = 0;
      Object.keys(listeningAnswers).forEach(key => {
        if (Array.isArray(listeningAnswers[key])) {
          actualListeningQuestions += 2;
        } else {
          actualListeningQuestions += 1;
        }
      });
      
      console.log(`- Listening array elements: ${Object.keys(listeningAnswers).length}`);
      console.log(`- Listening actual questions: ${actualListeningQuestions}`);
      
      // Show sample answers including multiple answer format
      const readingSample = Object.values(updatedTest.answers.get('reading') || {})?.slice(0, 5) || [];
      const listeningSample = Object.values(updatedTest.answers.get('listening') || {})?.slice(0, 5) || [];
      console.log(`\n📖 Sample Reading (first 5): ${JSON.stringify(readingSample)}`);
      console.log(`🎵 Sample Listening (first 5): ${JSON.stringify(listeningSample)}`);
      
      // Show multiple answer examples
      const multipleAnswers = [];
      Object.values(updatedTest.answers.get('listening') || {}).forEach((answer, index) => {
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
    console.error('❌ Error adding mark schemes:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook18Test1MarkScheme(); 
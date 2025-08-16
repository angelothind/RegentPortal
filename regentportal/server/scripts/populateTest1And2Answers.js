// server/scripts/populateTest1And2Answers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const populateTest1And2Answers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Test 1 Answers
    const test1ReadingAnswers = [
      // Reading Passage 1, Questions 1-13
      "FALSE", "FALSE", "NOT GIVEN", "FALSE", "NOT GIVEN", "TRUE", "TRUE", 
      "paint", "topspin", "training", "intestines / gut", "weights", "grips",

      // Reading Passage 2, Questions 14-26
      "D", "G", "C", "A", "G", "B", 
      ["B", "D"], ["B", "D"], ["C", "E"], ["C", "E"], // Multiple choice with multiple answers
      "grain", "punishment", "ransom",

      // Reading Passage 3, Questions 27-40
      "D", "A", "C", "D", "G", "J", "H", "B", "E", "C",
      "YES", "NOT GIVEN", "NO", "NOT GIVEN"
    ];

    const test1ListeningAnswers = [
      // Part 1 (Questions 1-10)
      "69", "stream", "data", "map", "visitors", "sounds", "freedom", "skills", "4.95", "leaders",
      
      // Part 2 (Questions 11-20)
      "B", "A", "B", "C", "A", "G", "C", "B", "D", "A",
      
      // Part 3 (Questions 21-30)
      ["B", "D"], ["A", "E"], "D", "G", "C", "B", "F", "H",
      
      // Part 4 (Questions 31-40)
      "walls", "son", "fuel", "oxygen", "rectangular", "lamps", "family", "winter", "soil", "rain"
    ];

    // Test 2 Answers
    const test2ReadingAnswers = [
      // Reading Passage 1, Questions 1-13
      "piston", "coal", "workshops", "labour / labor", "quality", "railway(s)", "sanitation",
      "NOT GIVEN", "FALSE", "NOT GIVEN", "TRUE", "TRUE", "NOT GIVEN",

      // Reading Passage 2, Questions 14-26
      "D", "F", "A", "C", "F",
      "injury", "serves", "excitement",
      "Visualisation / Visualization", ["B", "D"], ["A", "E"],

      // Reading Passage 3, Questions 27-40
      "H", "A", "C", "B", "J", "I",
      "YES", "NOT GIVEN", "YES", "NOT GIVEN", "NO",
      "C", "B", "D"
    ];

    const test2ListeningAnswers = [
      // Part 1 (Questions 1-10)
      "Mathieson", "beginners", "college", "New", "11", "instrument", "ear", "clapping", "recording", "alone",
      
      // Part 2 (Questions 11-20)
      "A", "B", "A", "B", "C", "A", ["C", "E"], ["A", "B"],
      
      // Part 3 (Questions 21-30)
      "A", "B", "B", "B", "E", "B", "A", "C", "C", "A",
      
      // Part 4 (Questions 31-40)
      "move", "short", "discs", "oxygen", "tube", "temperatures", "protein", "space", "seaweed", "endangered"
    ];

    // Test 3 Listening Answers (from the provided mark scheme)
    const test3ListeningAnswers = [
      // Part 1 (Questions 1-10)
      "harbour", "bridge", "3.30", "Rose", "sign", "purple", "samphire", "melon", "coconut", "strawberry",
      
      // Part 2 (Questions 11-20)
      "C", "D", "F", "G", "B", "H", ["D", "E"], ["B", "C"],
      
      // Part 3 (Questions 21-30)
      "C", "B", "A", "A", "C", "C", "H", "E", "B", "F",
      
      // Part 4 (Questions 31-40)
      "clothing", "mouths", "salt", "toothpaste", "fertilisers", "nutrients", "growth", "weight", "acid", "society"
    ];

    // Test 3 Reading Answers (from the provided mark scheme)
    const test3ReadingAnswers = [
      // Reading Passage 1, Questions 1-13
      "FALSE", "FALSE", "TRUE", "NOT GIVEN", "TRUE", "NOT GIVEN", "FALSE",
      "caves", "stone", "bones", "beads", "pottery", "spices",

      // Reading Passage 2, Questions 14-26
      "G", "A", "H", "B",
      "carbon", "fires", "biodiversity",
      "ditches", "subsidence",
      "A", "C", "D", "B",

      // Reading Passage 3, Questions 27-40
      "D", "A", "C", "B", "C", "E", "F", "B",
      "NO", "YES", "NO", "NOT GIVEN", "NOT GIVEN", "YES"
    ];

    // Test 4 Listening Answers (from the provided mark scheme)
    const test4ListeningAnswers = [
      // Part 1 (Questions 1-10)
      "Kaeden", "locker(s)", "passport", "uniform", "third", "0412 665 903", "yellow", "plastic", "ice", "gloves",
      
      // Part 2 (Questions 11-20)
      ["C", "E"], ["A", "D"], "A", "B", "C", "A", "C", "B",
      
      // Part 3 (Questions 21-30)
      "A", "C", "A", "B", "C", "D", "F", "A", "C", "G",
      
      // Part 4 (Questions 31-40)
      "competition", "food", "disease", "agriculture", "maps", "cattle", "speed", "monkeys", "fishing", "flooding"
    ];

    // Test 4 Reading Answers (from the provided mark scheme)
    const test4ReadingAnswers = [
      // Reading Passage 1, Questions 1-13
      "FALSE", "TRUE", "FALSE", "NOT GIVEN", "FALSE", "TRUE",
      "colonies", "spring", "endangered", "habitat(s)", "Europe", "southern", "diet",

      // Reading Passage 2, Questions 14-26
      "C", "F", "E", "D", "D", "B", "A",
      "E", "B", "C",
      "waste", "machinery", "caution",

      // Reading Passage 3, Questions 27-40
      "C", "C", "B", "A",
      "egalitarianism", "status", "hunting", "domineering", "autonomy",
      "NOT GIVEN", "NO", "YES", "NOT GIVEN", "NO"
    ];

    // Update Test 1
    const test1 = await Test.findOne({ title: 'Test 1' });
    if (test1) {
      const answersMap1 = new Map();
      answersMap1.set('reading', test1ReadingAnswers);
      answersMap1.set('listening', test1ListeningAnswers);
      
      test1.answers = answersMap1;
      await test1.save();
      console.log('✅ Successfully populated Test 1 with correct answers');
      console.log(`📝 Added ${test1ReadingAnswers.length} reading answers and ${test1ListeningAnswers.length} listening answers`);
    } else {
      console.log('❌ Test 1 not found in database');
    }

    // Update Test 2
    const test2 = await Test.findOne({ title: 'Test 2' });
    if (test2) {
      const answersMap2 = new Map();
      answersMap2.set('reading', test2ReadingAnswers);
      answersMap2.set('listening', test2ListeningAnswers);
      
      test2.answers = answersMap2;
      await test2.save();
      console.log('✅ Successfully populated Test 2 with correct answers');
      console.log(`📝 Added ${test2ReadingAnswers.length} reading answers and ${test2ListeningAnswers.length} listening answers`);
    } else {
      console.log('❌ Test 2 not found in database');
    }

    // Update Test 3
    const test3 = await Test.findOne({ title: 'Test 3' });
    if (test3) {
      const answersMap3 = new Map();
      answersMap3.set('listening', test3ListeningAnswers);
      answersMap3.set('reading', test3ReadingAnswers);
      
      test3.answers = answersMap3;
      await test3.save();
      console.log('✅ Successfully populated Test 3 with correct answers');
      console.log(`📝 Added ${test3ReadingAnswers.length} reading answers and ${test3ListeningAnswers.length} listening answers`);
    } else {
      console.log('❌ Test 3 not found in database');
    }

    // Update Test 4
    const test4 = await Test.findOne({ title: 'Test 4' });
    if (test4) {
      const answersMap4 = new Map();
      answersMap4.set('listening', test4ListeningAnswers);
      answersMap4.set('reading', test4ReadingAnswers);
      
      test4.answers = answersMap4;
      await test4.save();
      console.log('✅ Successfully populated Test 4 with correct answers');
      console.log(`📝 Added ${test4ReadingAnswers.length} reading answers and ${test4ListeningAnswers.length} listening answers`);
    } else {
      console.log('❌ Test 4 not found in database');
    }

    // Verify the updates
    console.log('\n📊 Verification:');
    const updatedTest1 = await Test.findOne({ title: 'Test 1' });
    const updatedTest2 = await Test.findOne({ title: 'Test 2' });
    const updatedTest3 = await Test.findOne({ title: 'Test 3' });
    const updatedTest4 = await Test.findOne({ title: 'Test 4' });
    
    if (updatedTest1) {
      console.log(`Test 1: ${updatedTest1.answers.size} answer keys`);
      if (updatedTest1.answers.has('reading')) {
        console.log(`  - Reading: ${updatedTest1.answers.get('reading').length} answers`);
      }
      if (updatedTest1.answers.has('listening')) {
        console.log(`  - Listening: ${updatedTest1.answers.get('listening').length} answers`);
      }
    }
    
    if (updatedTest2) {
      console.log(`Test 2: ${updatedTest2.answers.size} answer keys`);
      if (updatedTest2.answers.has('reading')) {
        console.log(`  - Reading: ${updatedTest2.answers.get('reading').length} answers`);
      }
      if (updatedTest2.answers.has('listening')) {
        console.log(`  - Listening: ${updatedTest2.answers.get('listening').length} answers`);
      }
    }

    if (updatedTest3) {
      console.log(`Test 3: ${updatedTest3.answers.size} answer keys`);
      if (updatedTest3.answers.has('reading')) {
        console.log(`  - Reading: ${updatedTest3.answers.get('reading').length} answers`);
      }
      if (updatedTest3.answers.has('listening')) {
        console.log(`  - Listening: ${updatedTest3.answers.get('listening').length} answers`);
      }
    }

    if (updatedTest4) {
      console.log(`Test 4: ${updatedTest4.answers.size} answer keys`);
      if (updatedTest4.answers.has('reading')) {
        console.log(`  - Reading: ${updatedTest4.answers.get('reading').length} answers`);
      }
      if (updatedTest4.answers.has('listening')) {
        console.log(`  - Listening: ${updatedTest4.answers.get('listening').length} answers`);
      }
    }

  } catch (err) {
    console.error('❌ Error populating test answers:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

populateTest1And2Answers(); 
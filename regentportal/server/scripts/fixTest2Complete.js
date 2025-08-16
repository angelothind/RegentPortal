require('dotenv').config();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const fixTest2Complete = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 2
    const test2 = await Test.findOne({ title: 'Test 2' });
    if (!test2) {
      console.log('❌ Test 2 not found');
      return;
    }

    console.log('✅ Found Test 2, fixing with complete correct reading mark scheme...');

    // Fix Test 2 structure to match Test 1 exactly with correct answers
    const correctedAnswers = {
      "reading": [
        // Reading Passage 1, Questions 1-13
        "piston",           // 1
        "coal",             // 2
        "workshops",        // 3
        "labour",           // 4
        "quality",          // 5
        "railway",          // 6
        "sanitation",       // 7
        "NOT GIVEN",        // 8
        "FALSE",            // 9
        "NOT GIVEN",        // 10
        "TRUE",             // 11
        "TRUE",             // 12
        "NOT GIVEN",        // 13
        
        // Reading Passage 2, Questions 14-26
        "D",                // 14
        "F",                // 15
        "A",                // 16
        "C",                // 17
        "F",                // 18
        "injury",           // 19
        "serves",           // 20
        "excitement",       // 21
        "Visualisation",    // 22
        ["B", "D"],         // 23&24 IN EITHER ORDER
        ["A", "E"],         // 25&26 IN EITHER ORDER
        
        // Reading Passage 3, Questions 27-40
        "H",                // 27
        "A",                // 28
        "C",                // 29
        "B",                // 30
        "J",                // 31
        "I",                // 32
        "YES",              // 33
        "NOT GIVEN",        // 34
        "YES",              // 35
        "NOT GIVEN",        // 36
        "NO",               // 37
        "C",                // 38
        "B",                // 39
        "D"                 // 40
      ],
      "listening": [
        // Part 1 - Questions 1-10
        "Smith",            // 1
        "intermediate",     // 2
        "community",        // 3
        "Main",             // 4
        "10",               // 5
        "guitar",           // 6
        "ear",              // 7
        "playing",          // 8
        "recording",        // 9
        "solo",             // 10
        
        // Part 2 - Questions 11-20
        "B",                // 11
        "A",                // 12
        "B",                // 13
        "C",                // 14
        "A",                // 15
        "D",                // 16
        "E",                // 17
        "F",                // 18
        "G",                // 19
        "H",                // 20
        
        // Part 3 - Questions 21-30
        "C",                // 21
        "B",                // 22
        "A",                // 23
        "A",                // 24
        "C",                // 25
        "C",                // 26
        "H",                // 27
        "E",                // 28
        "B",                // 29
        "F",                // 30
        
        // Part 4 - Questions 31-40
        "clothing",         // 31
        "mouths",           // 32
        "salt",             // 33
        "toothpaste",       // 34
        "fertilisers",      // 35
        "nutrients",        // 36
        "growth",           // 37
        "weight",           // 38
        "acid",             // 39
        "society"           // 40
      ]
    };

    // Update the answers
    test2.answers = correctedAnswers;
    await test2.save();

    console.log('✅ Test 2 completely fixed with correct reading mark scheme');
    console.log('📊 Total answer sections:', Object.keys(correctedAnswers).length);
    console.log('📖 Reading answers:', correctedAnswers.reading.length);
    console.log('🎧 Listening answers:', correctedAnswers.listening.length);
    
    // Verify the update
    const updatedTest2 = await Test.findOne({ title: 'Test 2' });
    console.log('📝 Verification - Complete structure:');
    console.log('Answer keys:', Object.keys(Object.fromEntries(updatedTest2.answers)));
    console.log('Reading Q1:', updatedTest2.answers.get('reading')[0]);
    console.log('Reading Q40:', updatedTest2.answers.get('reading')[39]);
    console.log('Listening L1:', updatedTest2.answers.get('listening')[0]);
    console.log('Listening L40:', updatedTest2.answers.get('listening')[39]);
    
    console.log('✅ Test 2 now has the EXACT same structure as Test 1 with correct answers!');
  } catch (err) {
    console.error('❌ Error fixing Test 2:', err);
  } finally {
    mongoose.connection.close();
  }
};

fixTest2Complete(); 
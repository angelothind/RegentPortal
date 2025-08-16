require('dotenv').config();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const fixTest3Structure = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 3
    const test3 = await Test.findOne({ title: 'Test 3' });
    if (!test3) {
      console.log('❌ Test 3 not found');
      return;
    }

    console.log('✅ Found Test 3, fixing structure to match Test 1 exactly...');

    // Fix Test 3 structure to match Test 1 exactly
    const correctedAnswers = {
      "reading": [
        // Reading Passage 1, Questions 1-13
        "FALSE",            // 1
        "FALSE",            // 2
        "TRUE",             // 3
        "NOT GIVEN",        // 4
        "TRUE",             // 5
        "NOT GIVEN",        // 6
        "FALSE",            // 7
        "caves",            // 8
        "stone",            // 9
        "bones",            // 10
        "beads",            // 11
        "pottery",          // 12
        "spices",           // 13
        
        // Reading Passage 2, Questions 14-26
        "G",                // 14
        "A",                // 15
        "H",                // 16
        "B",                // 17
        "carbon",           // 18
        "fires",            // 19
        "biodiversity",     // 20
        "ditches",          // 21
        "subsidence",       // 22
        "A",                // 23
        "C",                // 24
        "D",                // 25
        "B",                // 26
        
        // Reading Passage 3, Questions 27-40
        "D",                // 27
        "A",                // 28
        "C",                // 29
        "B",                // 30
        "C",                // 31
        "E",                // 32
        "F",                // 33
        "B",                // 34
        "NO",               // 35
        "YES",              // 36
        "NO",               // 37
        "NOT GIVEN",        // 38
        "NOT GIVEN",        // 39
        "YES"               // 40
      ],
      "listening": [
        // Part 1 - Questions 1-10
        "harbour",          // 1
        "bridge",           // 2
        "3.30",             // 3
        "Rose",             // 4
        "sign",             // 5
        "purple",           // 6
        "samphire",         // 7
        "melon",            // 8
        "coconut",          // 9
        "strawberry",       // 10
        
        // Part 2 - Questions 11-20
        "C",                // 11
        "D",                // 12
        "F",                // 13
        "G",                // 14
        "B",                // 15
        "H",                // 16
        "D",                // 17
        "E",                // 18
        "B",                // 19
        "C",                // 20
        
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
    test3.answers = correctedAnswers;
    await test3.save();

    console.log('✅ Test 3 structure fixed to match Test 1');
    console.log('📊 Total answer sections:', Object.keys(correctedAnswers).length);
    console.log('📖 Reading answers:', correctedAnswers.reading.length);
    console.log('🎧 Listening answers:', correctedAnswers.listening.length);
    
    // Verify the update
    const updatedTest3 = await Test.findOne({ title: 'Test 3' });
    console.log('📝 Verification - Structure matches Test 1:');
    console.log('Answer keys:', Object.keys(Object.fromEntries(updatedTest3.answers)));
    console.log('Reading Q1:', updatedTest3.answers.get('reading')[0]);
    console.log('Reading Q40:', updatedTest3.answers.get('reading')[39]);
    console.log('Listening L1:', updatedTest3.answers.get('listening')[0]);
    console.log('Listening L40:', updatedTest3.answers.get('listening')[39]);
    
    console.log('✅ Test 3 now has the EXACT same structure as Test 1!');
  } catch (err) {
    console.error('❌ Error fixing Test 3 structure:', err);
  } finally {
    mongoose.connection.close();
  }
};

fixTest3Structure(); 
// server/scripts/updateTest3ListeningAnswers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const updateTest3ListeningAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Correct listening answers for Test 3 from the mark scheme
    const correctListeningAnswers = [
      // Part 1: Questions 1-10 (Short answers)
      'harbour', // 1 - harbour/harbor
      'bridge',  // 2
      '3.30',   // 3 - 3.30/three thirty/½/half 3/three
      'Rose',   // 4 - Rose/rose
      'sign',   // 5
      'purple', // 6
      'samphire', // 7
      'melon',  // 8
      'coconut', // 9
      'strawberry', // 10

      // Part 2: Questions 11-20 (Multiple choice)
      'C',      // 11
      'D',      // 12
      'F',      // 13
      'G',      // 14
      'B',      // 15
      'H',      // 16
      'D',      // 17 - IN EITHER ORDER (D, E)
      'E',      // 18 - IN EITHER ORDER (D, E)
      'B',      // 19 - IN EITHER ORDER (B, C)
      'C',      // 20 - IN EITHER ORDER (B, C)

      // Part 3: Questions 21-30 (Multiple choice)
      'C',      // 21
      'B',      // 22
      'A',      // 23
      'A',      // 24
      'C',      // 25
      'C',      // 26
      'H',      // 27
      'E',      // 28
      'B',      // 29
      'F',      // 30

      // Part 4: Questions 31-40 (Short answers)
      'clothing',   // 31
      'mouths',     // 32
      'salt',       // 33
      'toothpaste', // 34
      'fertilisers', // 35 - fertilisers/fertilizers
      'nutrients',  // 36
      'growth',     // 37
      'weight',     // 38
      'acid',       // 39
      'society'     // 40
    ];

    // Find Test 3 and update its listening answers
    const test = await Test.findOne({ 
      bookId: 'Book19', 
      testNumber: 3 
    });

    if (!test) {
      console.log('❌ Test 3 not found in Book 19');
      return;
    }

    console.log('📝 Found Test 3:', test.title);
    console.log('📝 Current listening answers:', test.answers.get('listening'));

    // Update the listening answers
    test.answers.set('listening', correctListeningAnswers);

    // Save the updated test
    await test.save();

    console.log('✅ Updated listening answers for Test 3');
    console.log('📝 New listening answers:', test.answers.get('listening'));

    console.log('✅ Test 3 listening answers update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating Test 3 listening answers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the function
updateTest3ListeningAnswers(); 
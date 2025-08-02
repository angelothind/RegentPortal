// scripts/addReadingAnswers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const addReadingAnswers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find the existing test
    const existingTest = await Test.findOne({ title: 'Test 1' });
    
    if (!existingTest) {
      console.log('❌ Test not found');
      return;
    }

    console.log(`🔄 Replacing reading answers in: "${existingTest.title}"`);

    // Create reading answers based on the answer key
    const readingAnswers = new Map([
      // Reading Passage 1, Questions 1-13
      ['1', ['FALSE']],
      ['2', ['FALSE']],
      ['3', ['NOT GIVEN']],
      ['4', ['FALSE']],
      ['5', ['NOT GIVEN']],
      ['6', ['TRUE']],
      ['7', ['TRUE']],
      ['8', ['paint']],
      ['9', ['topspin']],
      ['10', ['training']],
      ['11', ['intestines', 'gut']],
      ['12', ['weights']],
      ['13', ['grips']],
      
      // Reading Passage 2, Questions 14-26
      ['14', ['D']],
      ['15', ['G']],
      ['16', ['C']],
      ['17', ['A']],
      ['18', ['G']],
      ['19', ['B']],
      ['20', ['C', 'E']], // IN EITHER ORDER
      ['21', ['C', 'E']], // IN EITHER ORDER
      ['22', ['B', 'D']], // IN EITHER ORDER
      ['23', ['B', 'D']], // IN EITHER ORDER
      ['24', ['grain']],
      ['25', ['punishment']],
      ['26', ['ransom']],
      
      // Reading Passage 3, Questions 27-40
      ['27', ['D']],
      ['28', ['A']],
      ['29', ['C']],
      ['30', ['D']],
      ['31', ['G']],
      ['32', ['J']],
      ['33', ['H']],
      ['34', ['B']],
      ['35', ['E']],
      ['36', ['C']],
      ['37', ['YES']],
      ['38', ['NOT GIVEN']],
      ['39', ['NO']],
      ['40', ['NOT GIVEN']]
    ]);

    // Update the test with reading answers
    const updatedTest = await Test.findByIdAndUpdate(
      existingTest._id,
      {
        $set: {
          'answers.Reading': readingAnswers
        }
      },
      { new: true }
    );

    console.log('✅ Reading answers replaced successfully!');
    console.log(`📝 Reading answers: ${updatedTest.answers.get('Reading').size} questions`);
    
    // Verify the data
    console.log('\n📊 Verification:');
    console.log('- Test title:', updatedTest.title);
    console.log('- Listening answers:', updatedTest.answers.get('Listening').size, 'questions');
    console.log('- Reading answers:', updatedTest.answers.get('Reading').size, 'questions');
    
    console.log('\n🎯 Reading Test Structure:');
    console.log('  - Passage 1 (Questions 1-13): TFNG + Fill in blanks');
    console.log('  - Passage 2 (Questions 14-26): Multiple choice + Fill in blanks');
    console.log('  - Passage 3 (Questions 27-40): Multiple choice + TFNG');
    
    console.log('\n✅ Reading answers replaced successfully!');
    
  } catch (err) {
    console.error('❌ Error adding reading answers:', err);
  } finally {
    mongoose.connection.close();
  }
};

addReadingAnswers(); 
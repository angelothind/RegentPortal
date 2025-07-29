// scripts/seedTests.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const seedTests = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    // Optional: Clear existing tests
    await Test.deleteMany({});
    console.log('🧹 Existing tests cleared');

    const tests = [
      {
        title: 'Test 1',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book19/Test1/audios/fullaudio.mp3'
          }
        ],
        answers: []
      },
      {
        title: 'Test 2',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book19/Test2/audios/fullaudio.mp3'
          }
        ],
        answers: []
      }
    ];

    await Test.insertMany(tests);
    console.log('✅ Seeded Test 1 and Test 2 with correct passages and audio');
  } catch (err) {
    console.error('❌ Error seeding tests:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedTests();
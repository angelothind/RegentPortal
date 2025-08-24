// server/scripts/createBook17.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Test = require('../models/Test');

const createBook17 = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Step 1: Create Book17 (initially with empty tests array)
    console.log('📚 Creating Book17...');
    let book17 = new Book({
      name: 'Book 17',
      tests: []
    });
    await book17.save();
    console.log('✅ Book17 created successfully with ID:', book17._id);

    // Step 2: Create the 4 tests for Book17
    console.log('🧪 Creating Book17 tests...');
    const tests = [
      {
        title: 'Test 1',
        belongsTo: 'Book 17',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test1/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test1/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test1/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book17/Test1/audios/fullaudio.mp3'
          }
        ],
        answers: new Map() // Empty answers for now
      },
      {
        title: 'Test 2',
        belongsTo: 'Book 17',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test2/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test2/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test2/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book17/Test2/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      },
      {
        title: 'Test 3',
        belongsTo: 'Book 17',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test3/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test3/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test3/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book17/Test3/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      },
      {
        title: 'Test 4',
        belongsTo: 'Book 17',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test4/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test4/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book17/Test4/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book17/Test4/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      }
    ];

    const createdTests = await Test.insertMany(tests);
    console.log('✅ All 4 Book17 tests created successfully');
    
    // Log the unique IDs for verification
    createdTests.forEach((test, index) => {
      console.log(`   Test ${index + 1}: ID=${test._id}, Title="${test.title}", belongsTo="${test.belongsTo}"`);
    });

    // Step 3: Update Book17 with test references
    console.log('🔗 Updating Book17 with test references...');
    const updatedBook = await Book.findOneAndUpdate(
      { name: 'Book 17' },
      {
        tests: createdTests.map((test) => ({
          testId: test._id,
          testName: test.title
        }))
      },
      { new: true }
    );

    console.log('✅ Book17 updated with test references');
    console.log(`📊 Book17 now contains ${updatedBook.tests.length} tests`);

    // Display summary
    console.log('\n🎉 Book17 Creation Complete!');
    console.log('📚 Book: Book 17');
    console.log('🧪 Tests: Test 1, Test 2, Test 3, Test 4');
    console.log('📖 Passages: 12 reading passages (3 per test)');
    console.log('🎵 Audio: 4 listening audio files (1 per test)');
    console.log('🔑 Key: Each test has proper sources and empty answers ready for content');

  } catch (err) {
    console.error('❌ Error creating Book17:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createBook17(); 
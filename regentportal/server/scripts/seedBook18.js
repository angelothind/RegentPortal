// server/scripts/seedBook18.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Test = require('../models/Test');

const seedBook18 = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if Book18 already exists
    let book18 = await Book.findOne({ name: 'Book 18' });
    
    if (book18) {
      console.log('📚 Book18 already exists, checking current state...');
      console.log(`   Book18 ID: ${book18._id}`);
      console.log(`   Current tests: ${book18.tests.length}`);
      
      // Check if tests already exist for Book18
      const existingTests = await Test.find({ belongsTo: 'Book 18' });
      if (existingTests.length > 0) {
        console.log(`⚠️  Found ${existingTests.length} existing tests for Book18`);
        console.log('   Clearing existing Book18 tests...');
        await Test.deleteMany({ belongsTo: 'Book 18' });
        console.log('✅ Existing Book18 tests cleared');
      }
      
      // Clear the tests array in Book18
      book18.tests = [];
      await book18.save();
      console.log('✅ Book18 tests array cleared');
    } else {
      // Step 1: Create Book18 (initially with empty tests array)
      console.log('📚 Creating Book18...');
      book18 = new Book({
        name: 'Book 18',
        tests: []
      });
      await book18.save();
      console.log('✅ Book18 created successfully with ID:', book18._id);
    }

    // Step 2: Seed the 4 tests for Book18 (using unique titles to avoid duplicate key errors)
    console.log('🧪 Seeding Book18 tests...');
    const tests = [
      {
        title: 'Book 18 - Test 1',  // Unique title to avoid conflicts
        belongsTo: 'Book 18', // This distinguishes it from other tests
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test1/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test1/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test1/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book18/Test1/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      },
      {
        title: 'Book 18 - Test 2',  // Unique title to avoid conflicts
        belongsTo: 'Book 18', // This distinguishes it from other tests
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test2/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test2/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test2/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book18/Test2/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      },
      {
        title: 'Book 18 - Test 3',  // Unique title to avoid conflicts
        belongsTo: 'Book 18', // This distinguishes it from other tests
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test3/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test3/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test3/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book18/Test3/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      },
      {
        title: 'Book 18 - Test 4',  // Unique title to avoid conflicts
        belongsTo: 'Book 18', // This distinguishes it from other tests
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test4/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test4/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book18/Test4/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book18/Test4/audios/fullaudio.mp3'
          }
        ],
        answers: new Map()
      }
    ];

    const createdTests = await Test.insertMany(tests);
    console.log('✅ All 4 Book18 tests created successfully');
    
    // Log the unique IDs for verification
    createdTests.forEach((test, index) => {
      console.log(`   Test ${index + 1}: ID=${test._id}, Title="${test.title}", belongsTo="${test.belongsTo}"`);
    });

    // Step 3: Update Book18 with test references
    console.log('🔗 Updating Book18 with test references...');
    const updatedBook = await Book.findOneAndUpdate(
      { name: 'Book 18' },
      {
        tests: createdTests.map((test) => ({
          testId: test._id,
          testName: test.title
        }))
      },
      { new: true }
    );

    console.log('✅ Book18 updated with test references');
    console.log(`📊 Book18 now contains ${updatedBook.tests.length} tests`);

    // Display summary
    console.log('\n🎉 Book18 Seeding Complete!');
    console.log('📚 Book: Book 18');
    console.log('🧪 Tests: Book 18 - Test 1, Book 18 - Test 2, Book 18 - Test 3, Book 18 - Test 4');
    console.log('📖 Passages: 12 reading passages (3 per test)');
    console.log('🎵 Audio: 4 listening audio files (1 per test)');
    console.log('🔑 Key: Each test has unique title and belongsTo field to distinguish from other books');

  } catch (err) {
    console.error('❌ Error seeding Book18:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedBook18(); 
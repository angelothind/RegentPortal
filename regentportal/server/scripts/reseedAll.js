// server/scripts/reseedAll.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Test = require('../models/Test');

const reseedAll = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Book.deleteMany({});
    await Test.deleteMany({});
    console.log('🧹 All collections cleared');

    // Seed tests first
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

    const createdTests = await Test.insertMany(tests);
    console.log('✅ Tests seeded:', createdTests.length);

    // Seed books with references to tests
    const book = new Book({
      name: 'Book 19',
      tests: createdTests.map((test) => ({
        testId: test._id,
        testName: test.title
      }))
    });

    await book.save();
    console.log('✅ Book seeded with test references');

    // Verify the data
    const allBooks = await Book.find({}).populate('tests.testId');
    const allTests = await Test.find({});
    
    console.log('📊 Verification:');
    console.log('- Books in DB:', allBooks.length);
    console.log('- Tests in DB:', allTests.length);
    console.log('- Book tests:', allBooks[0]?.tests?.length || 0);
    
    console.log('✅ Reseeding completed successfully!');
  } catch (err) {
    console.error('❌ Error reseeding:', err);
  } finally {
    mongoose.connection.close();
  }
};

reseedAll(); 
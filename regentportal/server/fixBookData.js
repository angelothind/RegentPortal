// server/fixBookData.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Book = require('./models/Book');
const Test = require('./models/Test');

const fixBookData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all tests
    const tests = await Test.find({});
    console.log('📊 Found tests:', tests.length);
    
    if (tests.length === 0) {
      console.log('❌ No tests found. Creating tests first...');
      // Create some basic tests if none exist
      const test1 = new Test({
        title: 'Test 1',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage1.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book19/Test1/audios/fullaudio.mp3'
          }
        ],
        answers: {}
      });
      
      const test2 = new Test({
        title: 'Test 2',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage1.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book19/Test2/audios/fullaudio.mp3'
          }
        ],
        answers: {}
      });
      
      await test1.save();
      await test2.save();
      console.log('✅ Created tests');
    }

    // Get updated tests
    const updatedTests = await Test.find({});
    console.log('📊 Updated tests:', updatedTests.map(t => ({ _id: t._id, title: t.title })));

    // Update the book with proper test references
    const book = await Book.findOne({ name: 'Book 19' });
    if (book) {
      book.tests = [
        {
          testId: updatedTests[0]._id,
          testName: 'Test 1'
        },
        {
          testId: updatedTests[1]._id,
          testName: 'Test 2'
        }
      ];
      
      await book.save();
      console.log('✅ Updated book with proper test references');
    } else {
      console.log('❌ Book 19 not found');
    }

    // Verify the fix
    const updatedBook = await Book.findOne({ name: 'Book 19' }).populate('tests.testId');
    console.log('📋 Updated book data:', {
      name: updatedBook.name,
      tests: updatedBook.tests.map(t => ({
        testId: t.testId?._id,
        testName: t.testName,
        testTitle: t.testId?.title
      }))
    });

  } catch (error) {
    console.error('❌ Error fixing book data:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixBookData(); 
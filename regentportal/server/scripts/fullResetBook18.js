// server/scripts/fullResetBook18.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Test = require('../models/Test');

const fullResetBook18 = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Complete cleanup of Book18
    console.log('\n🗑️  Complete cleanup of Book18...');
    
    // Remove all Book18 tests
    const deletedTests = await Test.deleteMany({ belongsTo: 'Book 18' });
    console.log(`✅ Deleted ${deletedTests.deletedCount} Book18 tests`);
    
    // Remove Book18 document
    const deletedBook = await Book.deleteOne({ name: 'Book 18' });
    console.log(`✅ Deleted Book18 document`);
    
    // Step 2: Reseed Book18 from scratch
    console.log('\n📚 Creating fresh Book18...');
    const book18 = new Book({
      name: 'Book 18',
      tests: []
    });
    await book18.save();
    console.log('✅ Fresh Book18 created with ID:', book18._id);
    
    // Step 3: Create fresh tests with clean titles
    console.log('\n🧪 Creating fresh Book18 tests...');
    const tests = [
      {
        title: 'Test 1',
        belongsTo: 'Book 18',
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
        title: 'Test 2',
        belongsTo: 'Book 18',
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
        title: 'Test 3',
        belongsTo: 'Book 18',
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
        title: 'Test 4',
        belongsTo: 'Book 18',
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
    console.log('✅ All 4 fresh Book18 tests created successfully');
    
    // Log the fresh test details
    createdTests.forEach((test, index) => {
      console.log(`   Test ${index + 1}: ID=${test._id}, Title="${test.title}", belongsTo="${test.belongsTo}"`);
    });
    
    // Step 4: Update Book18 with fresh test references
    console.log('\n🔗 Updating Book18 with fresh test references...');
    const updatedBook = await Book.findOneAndUpdate(
      { name: 'Book 18' },
      {
        tests: createdTests.map((test) => ({
          testId: test._id,
          testName: test.title  // This should be clean: "Test 1", "Test 2", etc.
        }))
      },
      { new: true }
    );
    
    console.log('✅ Book18 updated with fresh test references');
    console.log(`📊 Book18 now contains ${updatedBook.tests.length} tests`);
    
    // Step 5: Verify the fresh data
    console.log('\n📊 Final verification of fresh data...');
    const finalBook18 = await Book.findOne({ name: 'Book 18' });
    console.log('Book18 tests array:');
    finalBook18.tests.forEach((test, index) => {
      console.log(`   ${index + 1}: testName="${test.testName}", testId="${test.testId}"`);
    });
    
    // Step 6: Test API response
    console.log('\n🧪 Testing API response...');
    const book18Tests = await Test.find({ belongsTo: 'Book 18' });
    console.log('Individual test documents:');
    book18Tests.forEach(t => {
      console.log(`   - ${t.title} (belongsTo: ${t.belongsTo})`);
    });
    
    console.log('\n🎉 Full Book18 reset completed successfully!');
    console.log('📚 Fresh Book18 created with clean test names');
    console.log('🧪 All tests recreated with proper structure');
    console.log('🔗 Book18.tests array properly populated');
    console.log('🎯 Frontend should now show clean names after refresh');
    console.log('\n⚠️  IMPORTANT: Hard refresh your frontend (Ctrl+Shift+R)');
    
  } catch (err) {
    console.error('❌ Error during full Book18 reset:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

fullResetBook18(); 
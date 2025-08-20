// server/scripts/fixBookNames.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');
const Book = require('../models/Book');

const fixBookNames = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Fix Test documents
    console.log('🔧 Fixing Test documents...');
    const testsToUpdate = await Test.find({ belongsTo: { $regex: /Book \d+/ } });
    console.log(`Found ${testsToUpdate.length} tests with spaces in book names`);

    for (const test of testsToUpdate) {
      const oldBookName = test.belongsTo;
      const newBookName = oldBookName.replace(/\s+/g, '');
      
      if (oldBookName !== newBookName) {
        console.log(`Updating test "${test.title}" from "${oldBookName}" to "${newBookName}"`);
        test.belongsTo = newBookName;
        await test.save();
      }
    }

    // Fix Book documents
    console.log('🔧 Fixing Book documents...');
    const booksToUpdate = await Book.find({ name: { $regex: /Book \d+/ } });
    console.log(`Found ${booksToUpdate.length} books with spaces in names`);

    for (const book of booksToUpdate) {
      const oldBookName = book.name;
      const newBookName = oldBookName.replace(/\s+/g, '');
      
      if (oldBookName !== newBookName) {
        console.log(`Updating book from "${oldBookName}" to "${newBookName}"`);
        book.name = newBookName;
        await book.save();
      }
    }

    // Verify the fixes
    console.log('\n📊 Verification:');
    const allTests = await Test.find({});
    const allBooks = await Book.find({});
    
    console.log('\nTests:');
    allTests.forEach(test => {
      console.log(`  ${test.title}: ${test.belongsTo}`);
    });
    
    console.log('\nBooks:');
    allBooks.forEach(book => {
      console.log(`  ${book.name}`);
    });

    console.log('\n✅ Book names fixed successfully!');
    console.log('📁 Directory structure should now match database values');

  } catch (err) {
    console.error('❌ Error fixing book names:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

fixBookNames(); 
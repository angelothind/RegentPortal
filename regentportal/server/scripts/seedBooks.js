// server/scripts/seedBooks.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Test = require('../models/Test');

const seedBooks = async () => {
  try {
    await connectDB();

    await Book.deleteMany({});
    console.log('🧹 Existing books cleared');

    const tests = await Test.find({});

    const book = new Book({
      name: 'Book 19',
      tests: tests.map((test) => ({
        testId: test._id,
        testName: test.title
      }))
    });

    await book.save();

    console.log('✅ Book seeded with tests');
  } catch (err) {
    console.error('❌ Error seeding book:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedBooks();
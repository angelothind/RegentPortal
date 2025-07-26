const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Test = require('../models/Test');

router.get('/', async (req, res) => {
  console.log('📘 /api/books hit'); // ✅ Always shows this
  try {
    const books = await Book.find().populate('tests.testId');
    console.log('✅ Books found:', books.length);
    res.json(books);
  } catch (err) {
    console.error('❌ Error in /api/books route:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
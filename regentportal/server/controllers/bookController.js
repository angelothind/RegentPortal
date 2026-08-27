const Book = require('../models/Book');

const listBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('tests.testId');
    res.json(books);
  } catch (err) {
    console.error('Error in /api/books route:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { listBooks };

const Book = require('../models/Book');

const bookNumber = (name) => {
  const match = String(name).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

const listBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('tests.testId');
    books.sort((a, b) => bookNumber(b.name) - bookNumber(a.name));
    res.json(books);
  } catch (err) {
    console.error('Error in /api/books route:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { listBooks };

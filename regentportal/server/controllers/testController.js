// controllers/testController.js
const ReadingTest = require('../models/ReadingTest');

const createReadingTest = async (req, res) => {
  try {
    const test = await ReadingTest.create(req.body);
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createReadingTest };
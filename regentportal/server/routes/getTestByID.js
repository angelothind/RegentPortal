// routes/getTestById.js
const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

router.get('/:testId', async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
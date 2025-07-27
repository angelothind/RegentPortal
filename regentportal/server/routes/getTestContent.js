const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const path = require('path');
const fs = require('fs');

// Original: load all content
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const loadedSources = test.sources.map(source => {
      const absolutePath = path.join(__dirname, '..', source.contentPath);
      const rawContent = fs.readFileSync(absolutePath, 'utf-8');
      return {
        name: source.name,
        content: JSON.parse(rawContent)
      };
    });

    res.json({ ...test.toObject(), sources: loadedSources });
  } catch (err) {
    console.error('❌ Failed to load test content:', err.message);
    res.status(500).json({ error: 'Failed to load test content' });
  }
});

// 🔥 New: reading-only content (JSON sources)
router.get('/:id/reading', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const readingSources = test.sources.filter(source =>
      source.contentPath.endsWith('.json')
    );

    const loadedSources = readingSources.map(source => {
      const absolutePath = path.join(__dirname, '..', source.contentPath);
      const rawContent = fs.readFileSync(absolutePath, 'utf-8');
      return {
        name: source.name,
        content: JSON.parse(rawContent)
      };
    });

    res.json({
      testId: test._id,
      title: test.title,
      sources: loadedSources
    });
  } catch (err) {
    console.error('❌ Failed to load reading content:', err.message);
    res.status(500).json({ error: 'Failed to load reading content' });
  }
});

module.exports = router;
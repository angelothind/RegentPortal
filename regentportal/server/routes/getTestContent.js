const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const path = require('path');
const fs = require('fs');

// 🔒 SECURE: Reading-only content (JSON sources only)
router.get('/:id/reading', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    // Backend filters for JSON sources only
    const readingSources = test.sources.filter(source =>
      source.contentPath.endsWith('.json')
    );

    const loadedSources = readingSources.map(source => {
      // Add 'assets/' prefix since database stores paths without it
      const filePath = `assets/${source.contentPath}`;
      const absolutePath = path.join(__dirname, '..', filePath);
      
      // Validate file exists before reading
      if (!fs.existsSync(absolutePath)) {
        console.error(`❌ File not found: ${absolutePath}`);
        return null;
      }
      
      const rawContent = fs.readFileSync(absolutePath, 'utf-8');
      return {
        name: source.name,
        sourceType: source.sourceType,
        contentPath: source.contentPath, // Keep path for frontend to fetch JSON
        content: JSON.parse(rawContent)
      };
    }).filter(source => source !== null); // Remove null entries

    res.json({
      testId: test._id,
      title: test.title,
      testType: 'Reading',
      sources: loadedSources
    });
  } catch (err) {
    console.error('❌ Failed to load reading content:', err.message);
    res.status(500).json({ error: 'Failed to load reading content' });
  }
});

// 🔒 SECURE: Listening-only content (MP3 sources only)
router.get('/:id/listening', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    // Backend filters for MP3 sources only
    const listeningSources = test.sources.filter(source =>
      source.contentPath.endsWith('.mp3')
    );

    const loadedSources = listeningSources.map(source => {
      // Add 'assets/' prefix since database stores paths without it
      const filePath = `assets/${source.contentPath}`;
      const absolutePath = path.join(__dirname, '..', filePath);
      
      // Validate file exists
      if (!fs.existsSync(absolutePath)) {
        console.error(`❌ File not found: ${absolutePath}`);
        return null;
      }
      
      return {
        name: source.name,
        sourceType: source.sourceType,
        contentPath: source.contentPath // Keep path for frontend to fetch audio
      };
    }).filter(source => source !== null); // Remove null entries

    res.json({
      testId: test._id,
      title: test.title,
      testType: 'Listening',
      sources: loadedSources
    });
  } catch (err) {
    console.error('❌ Failed to load listening content:', err.message);
    res.status(500).json({ error: 'Failed to load listening content' });
  }
});

// 🔒 SECURE: Generic route that respects test type parameter
router.get('/:id', async (req, res) => {
  try {
    const { testType } = req.query; // Get test type from query parameter
    const test = await Test.findById(req.params.id);
    
    if (!test) return res.status(404).json({ error: 'Test not found' });

    let filteredSources;
    
    if (testType === 'Reading') {
      // Filter for JSON sources only
      filteredSources = test.sources.filter(source =>
        source.contentPath.endsWith('.json')
      );
    } else if (testType === 'Listening') {
      // Filter for MP3 sources only
      filteredSources = test.sources.filter(source =>
        source.contentPath.endsWith('.mp3')
      );
    } else {
      // If no test type specified, return all sources (less secure, but backward compatible)
      filteredSources = test.sources;
    }

    const loadedSources = filteredSources.map(source => {
      // Add 'assets/' prefix since database stores paths without it
      const filePath = `assets/${source.contentPath}`;
      const absolutePath = path.join(__dirname, '..', filePath);
      
      // Validate file exists
      if (!fs.existsSync(absolutePath)) {
        console.error(`❌ File not found: ${absolutePath}`);
        return null;
      }
      
      if (source.contentPath.endsWith('.json')) {
        // Load JSON content for reading sources
        const rawContent = fs.readFileSync(absolutePath, 'utf-8');
        return {
          name: source.name,
          sourceType: source.sourceType,
          contentPath: source.contentPath,
          content: JSON.parse(rawContent)
        };
      } else {
        // Just return path for audio sources
        return {
          name: source.name,
          sourceType: source.sourceType,
          contentPath: source.contentPath
        };
      }
    }).filter(source => source !== null); // Remove null entries

    res.json({
      ...test.toObject(),
      testType: testType || 'All',
      sources: loadedSources
    });
  } catch (err) {
    console.error('❌ Failed to load test content:', err.message);
    res.status(500).json({ error: 'Failed to load test content' });
  }
});

module.exports = router;
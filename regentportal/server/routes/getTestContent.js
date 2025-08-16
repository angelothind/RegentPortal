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

    // Get reading answers from the test and map them to question numbers
    const readingAnswers = test.answers?.get('reading') || [];
    const correctAnswers = {};
    
    // Map the flat array of answers to question numbers (1-40)
    readingAnswers.forEach((answer, index) => {
      correctAnswers[index + 1] = answer;
    });

    res.json({
      testId: test._id,
      title: test.title,
      testType: 'Reading',
      sources: loadedSources,
      correctAnswers: correctAnswers // Include the mapped answer key
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

    // Get listening answers from the test and map them to question numbers
    const listeningAnswers = test.answers?.get('listening') || [];
    const correctAnswers = {};
    
    // Map the flat array of answers to question numbers (1-40)
    listeningAnswers.forEach((answer, index) => {
      correctAnswers[index + 1] = answer;
    });

    res.json({
      testId: test._id,
      title: test.title,
      testType: 'Listening',
      sources: listeningSources,
      correctAnswers: correctAnswers // Include the mapped answer key
    });
  } catch (err) {
    console.error('❌ Failed to load listening content:', err.message);
    res.status(500).json({ error: 'Failed to load listening content' });
  }
});

// 🔒 SECURE: Get question templates for a specific test and part
router.get('/:id/questions/:part', async (req, res) => {
  try {
    const { id, part } = req.params;
    const { testType } = req.query; // Get test type from query parameter
    const test = await Test.findById(id);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (!testType) {
      return res.status(400).json({ error: 'Test type is required' });
    }

    // Construct the path to the question file based on user's selection
    const testPath = test.title.replace(/\s+/g, ''); // "Test 1" -> "Test1"
    
    // Extract just the number from the part parameter (e.g., "part1" -> "1")
    const partNumber = part.replace(/^part/i, '');
    const questionFilePath = `assets/Books/Book19/${testPath}/questions/${testType.charAt(0).toUpperCase() + testType.slice(1)}/part${partNumber}.json`;
    const absolutePath = path.join(__dirname, '..', questionFilePath);
    
    console.log(`🔍 Looking for question file: ${absolutePath}`);
    console.log(`📋 User selected test type: ${testType}`);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ Question file not found: ${absolutePath}`);
      return res.status(404).json({ error: 'Question file not found' });
    }
    
    // Read and parse the JSON file
    const rawContent = fs.readFileSync(absolutePath, 'utf-8');
    const questionData = JSON.parse(rawContent);
    
    console.log(`✅ Question file loaded: ${part}.json`);
    
    res.json({
      testId: test._id,
      title: test.title,
      part: part,
      testType: testType,
      questionData: questionData
    });
    
  } catch (err) {
    console.error('❌ Failed to load question file:', err.message);
    res.status(500).json({ error: 'Failed to load question file' });
  }
});

module.exports = router;
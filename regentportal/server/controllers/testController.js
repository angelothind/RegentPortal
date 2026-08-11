const Test = require('../models/Test');
const testContentService = require('../services/testContentService');

const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 🔒 SECURE: Reading-only content (JSON sources only)
const getReadingContent = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const loadedSources = testContentService.loadReadingSources(test);

    // Get reading answers from the test and map them to question numbers
    const readingAnswers = test.answers?.get('reading') || [];
    const correctAnswers = testContentService.mapAnswersToQuestionNumbers(readingAnswers);

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
};

// 🔒 SECURE: Listening-only content (MP3 sources only)
const getListeningContent = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const listeningSources = testContentService.loadListeningSources(test);

    // Get listening answers from the test and map them to question numbers
    const listeningAnswers = test.answers?.get('listening') || [];
    const correctAnswers = testContentService.mapAnswersToQuestionNumbers(listeningAnswers);

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
};

// 🔒 SECURE: Get question templates for a specific test and part
const getQuestionsForPart = async (req, res) => {
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

    const { found, questionData, questionFilePath } = testContentService.loadQuestionFile(test, part, testType);

    if (!found) {
      return res.status(404).json({
        error: 'No questions available for this test',
        details: `Question file not found: ${questionFilePath}`,
        testBook: test.belongsTo,
        testTitle: test.title,
        testType: testType,
        part: part
      });
    }

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
};

module.exports = { getTestById, getReadingContent, getListeningContent, getQuestionsForPart };

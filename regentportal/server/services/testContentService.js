const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..');

const mapAnswersToQuestionNumbers = (answers) => {
  const correctAnswers = {};

  // Handle both array format and MongoDB array-as-object format
  if (Array.isArray(answers)) {
    answers.forEach((answer, index) => {
      correctAnswers[index + 1] = answer;
    });
  } else if (typeof answers === 'object' && answers !== null) {
    Object.keys(answers).forEach(indexStr => {
      const index = parseInt(indexStr);
      if (!isNaN(index)) {
        correctAnswers[index + 1] = answers[indexStr];
      }
    });
  }

  return correctAnswers;
};

// Loads and parses the JSON passage files referenced by a test's reading sources.
const loadReadingSources = (test) => {
  const readingSources = test.sources.filter(source => source.contentPath.endsWith('.json'));

  return readingSources
    .map(source => {
      // Add 'assets/' prefix since database stores paths without it
      const filePath = `assets/${source.contentPath}`;
      const absolutePath = path.join(ASSETS_DIR, filePath);

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
    })
    .filter(source => source !== null); // Remove null entries
};

// Returns the MP3 source references for a test's listening sources.
const loadListeningSources = (test) => test.sources.filter(source => source.contentPath.endsWith('.mp3'));

// Locates and parses the question-template JSON file for a test part.
const loadQuestionFile = (test, part, testType) => {
  // Construct the path to the question file based on test's book and title
  const testPath = test.title.replace(/\s+/g, ''); // "Test 1" -> "Test1"

  // Extract just the number from the part parameter (e.g., "part1" -> "1")
  const partNumber = part.replace(/^part/i, '');
  const questionFilePath = `assets/Books/${test.belongsTo}/${testPath}/questions/${testType.charAt(0).toUpperCase() + testType.slice(1)}/part${partNumber}.json`;
  const absolutePath = path.join(ASSETS_DIR, questionFilePath);

  console.log(`🔍 Looking for question file: ${absolutePath}`);
  console.log(`📋 User selected test type: ${testType}`);
  console.log(`📚 Test belongs to: ${test.belongsTo}`);
  console.log(`🧪 Test title: ${test.title}`);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Question file not found: ${absolutePath}`);
    return { found: false, questionFilePath };
  }

  const rawContent = fs.readFileSync(absolutePath, 'utf-8');
  const questionData = JSON.parse(rawContent);

  console.log(`✅ Question file loaded: ${part}.json`);

  return { found: true, questionData };
};

module.exports = { mapAnswersToQuestionNumbers, loadReadingSources, loadListeningSources, loadQuestionFile };

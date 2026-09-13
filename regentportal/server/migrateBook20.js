require('dotenv').config({ path: require('path').join(__dirname, '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Book = require('./models/Book');
const Test = require('./models/Test');
const { normalizePaper } = require('./assets/Books/Book20/markSchemeFormat');
const markSchemes = require('./assets/Books/Book20/markSchemes.json');

const BOOK_FOLDER = 'Book20';
const BOOK_NAME = 'Book 20';
const TEST_TITLES = ['Test 1', 'Test 2', 'Test 3', 'Test 4'];
const QUESTION_NUMBERS = Array.from({ length: 40 }, (_, i) => String(i + 1));

const buildSources = (testTitle) => {
  const folder = testTitle.replace(/\s+/g, '');
  return [
    { name: 'passage1', sourceType: 'Reading', contentPath: `Books/${BOOK_FOLDER}/${folder}/passages/passage1.json` },
    { name: 'passage2', sourceType: 'Reading', contentPath: `Books/${BOOK_FOLDER}/${folder}/passages/passage2.json` },
    { name: 'passage3', sourceType: 'Reading', contentPath: `Books/${BOOK_FOLDER}/${folder}/passages/passage3.json` },
    { name: 'audio1', sourceType: 'Listening', contentPath: `Books/${BOOK_FOLDER}/${folder}/audios/fullaudio.mp3` },
  ];
};

const assertCompletePaper = (testTitle, skill, answers) => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new Error(`${testTitle} ${skill} mark scheme is missing`);
  }
  const missing = QUESTION_NUMBERS.filter((n) => answers[n] == null || answers[n] === '');
  if (missing.length) {
    throw new Error(`${testTitle} ${skill} is missing questions: ${missing.join(', ')}`);
  }
};

const migrateBook20 = async () => {
  await connectDB();
  console.log('Connected to MongoDB');

  const bookRefs = [];

  for (const title of TEST_TITLES) {
    const papers = markSchemes[title];
    if (!papers) {
      throw new Error(`No mark scheme entry for ${title}`);
    }

    const reading = normalizePaper(title, 'reading', papers.reading);
    const listening = normalizePaper(title, 'listening', papers.listening);
    assertCompletePaper(title, 'reading', reading);
    assertCompletePaper(title, 'listening', listening);

    let test = await Test.findOne({ title, belongsTo: BOOK_FOLDER });
    if (!test) {
      test = new Test({ title, belongsTo: BOOK_FOLDER });
    }

    test.sources = buildSources(title);
    test.answers = new Map([
      ['reading', reading],
      ['listening', listening],
    ]);
    await test.save();

    bookRefs.push({ testId: test._id, testName: title });
    console.log(`Upserted ${BOOK_NAME} ${title} (${test._id})`);
  }

  let book = await Book.findOne({ name: BOOK_NAME });
  if (!book) {
    book = await Book.findOne({ name: BOOK_FOLDER });
  }
  if (!book) {
    book = new Book({ name: BOOK_NAME, tests: bookRefs });
  } else {
    book.name = BOOK_NAME;
    book.tests = bookRefs;
  }
  await book.save();
  console.log(`Upserted book ${BOOK_NAME} with ${book.tests.length} tests`);
};

migrateBook20()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error('Book20 migrate failed:', err.message);
    mongoose.connection.close().finally(() => process.exit(1));
  });

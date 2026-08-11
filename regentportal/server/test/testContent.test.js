const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnvironment, stopTestEnvironment, clearDatabase } = require('./setup');

const Test = require('../models/Test');

let app;

before(async () => {
  app = await startTestEnvironment();
});

after(async () => {
  await stopTestEnvironment();
});

beforeEach(async () => {
  await clearDatabase();
});

async function createBook18Test1() {
  return Test.create({
    title: 'Test 1',
    belongsTo: 'Book18',
    sources: [
      { name: 'passage1', sourceType: 'Reading', contentPath: 'Books/Book18/Test1/passages/passage1.json' },
      { name: 'audio1', sourceType: 'Listening', contentPath: 'Books/Book18/Test1/audios/fullaudio.mp3' }
    ],
    answers: {
      reading: ['answerA', 'answerB'],
      listening: ['answerC']
    }
  });
}

test('GET /api/test/:testId returns the full test document', async () => {
  const testDoc = await createBook18Test1();

  const res = await request(app).get(`/api/test/${testDoc._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Test 1');
  assert.equal(res.body.belongsTo, 'Book18');
});

test('GET /api/test/:testId 404s for an unknown id', async () => {
  const res = await request(app).get('/api/test/507f1f77bcf86cd799439011');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Test not found');
});

test('GET /api/tests/:id/reading returns only JSON sources plus a mapped answer key', async () => {
  const testDoc = await createBook18Test1();

  const res = await request(app).get(`/api/tests/${testDoc._id}/reading`);

  assert.equal(res.status, 200);
  assert.equal(res.body.testType, 'Reading');
  assert.equal(res.body.sources.length, 1);
  assert.equal(res.body.sources[0].contentPath, 'Books/Book18/Test1/passages/passage1.json');
  assert.equal(res.body.sources[0].content.title, 'Urban farming');
  assert.deepEqual(res.body.correctAnswers, { 1: 'answerA', 2: 'answerB' });
});

test('GET /api/tests/:id/listening returns only MP3 sources plus a mapped answer key', async () => {
  const testDoc = await createBook18Test1();

  const res = await request(app).get(`/api/tests/${testDoc._id}/listening`);

  assert.equal(res.status, 200);
  assert.equal(res.body.testType, 'Listening');
  assert.equal(res.body.sources.length, 1);
  assert.equal(res.body.sources[0].contentPath, 'Books/Book18/Test1/audios/fullaudio.mp3');
  assert.deepEqual(res.body.correctAnswers, { 1: 'answerC' });
});

test('GET /api/tests/:id/questions/:part loads question JSON by book/test/type', async () => {
  const testDoc = await createBook18Test1();

  const res = await request(app)
    .get(`/api/tests/${testDoc._id}/questions/part1`)
    .query({ testType: 'Reading' });

  assert.equal(res.status, 200);
  assert.equal(res.body.part, 'part1');
  assert.equal(res.body.testType, 'Reading');
  assert.ok(res.body.questionData);
});

test('GET /api/tests/:id/questions/:part requires a testType query param', async () => {
  const testDoc = await createBook18Test1();

  const res = await request(app).get(`/api/tests/${testDoc._id}/questions/part1`);

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Test type is required');
});

test('GET /api/tests/:id/questions/:part 404s when the question file is missing', async () => {
  const testDoc = await createBook18Test1();

  const res = await request(app)
    .get(`/api/tests/${testDoc._id}/questions/part9`)
    .query({ testType: 'Reading' });

  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'No questions available for this test');
});

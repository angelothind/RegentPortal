const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnvironment, stopTestEnvironment, clearDatabase } = require('./setup');

const Test = require('../models/Test');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Book = require('../models/Book');
const TestSubmission = require('../models/TestSubmission');

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

test('POST /api/submit/submit grades against database answers and stores a submission', async () => {
  const testDoc = await Test.create({
    title: 'Test 1',
    belongsTo: 'Book18',
    sources: [],
    answers: { reading: ['B', 'A', 'C'] }
  });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const res = await request(app)
    .post('/api/submit/submit')
    .send({
      testId: testDoc._id.toString(),
      testType: 'reading',
      studentId: student._id.toString(),
      answers: { 1: 'B', 2: 'X', 3: 'C' }
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.totalQuestions, 3);
  assert.equal(res.body.data.correctCount, 2);
  assert.equal(res.body.data.score, 67);
  assert.ok(res.body.data.submissionId);

  const stored = await TestSubmission.findById(res.body.data.submissionId);
  assert.ok(stored);
  assert.equal(stored.score, 67);
});

test('POST /api/submit/submit persists sanitized highlights and echoes them back', async () => {
  const testDoc = await Test.create({
    title: 'Test 1',
    belongsTo: 'Book18',
    sources: [],
    answers: { reading: ['B'] }
  });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const res = await request(app)
    .post('/api/submit/submit')
    .send({
      testId: testDoc._id.toString(),
      testType: 'reading',
      studentId: student._id.toString(),
      answers: { 1: 'B' },
      highlights: {
        'reading-passage-1': [{ start: 0, end: 12, id: 'h1', comment: '  needs work  ' }],
        'reading-questions-1': [{ start: 4, end: 9 }]
      }
    });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data.highlights, {
    'reading-passage-1': [{ start: 0, end: 12, id: 'h1', comment: 'needs work' }],
    'reading-questions-1': [{ start: 4, end: 9 }]
  });

  const stored = await TestSubmission.findById(res.body.data.submissionId);
  assert.deepEqual(stored.highlights, {
    'reading-passage-1': [{ start: 0, end: 12, id: 'h1', comment: 'needs work' }],
    'reading-questions-1': [{ start: 4, end: 9 }]
  });
});

test('POST /api/submit/submit still succeeds when the highlights payload is malformed', async () => {
  const testDoc = await Test.create({
    title: 'Test 1',
    belongsTo: 'Book18',
    sources: [],
    answers: { reading: ['B'] }
  });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const submit = (highlights) =>
    request(app)
      .post('/api/submit/submit')
      .send({
        testId: testDoc._id.toString(),
        testType: 'reading',
        studentId: student._id.toString(),
        answers: { 1: 'B' },
        highlights
      });

  const payloads = [
    'nope',
    42,
    [{ start: 0, end: 1 }],
    { 'reading-passage-1': [{ start: 5, end: 5 }, { start: 9, end: 2 }] },
    { 'reading-passage-1': [{ start: -3, end: 1.5 }] },
    JSON.parse('{"__proto__": [{"start": 0, "end": 4}]}'),
    { 'dotted.key': [{ start: 0, end: 4 }] },
    { $set: [{ start: 0, end: 4 }] },
    { 'reading-passage-1': 'nope' }
  ];

  for (const payload of payloads) {
    const res = await submit(payload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data.highlights, {});

    const stored = await TestSubmission.findById(res.body.data.submissionId);
    assert.deepEqual(stored.highlights, {});
  }

  assert.equal(Object.prototype.start, undefined);
});

test('POST /api/submit/submit rejects a request missing testId/studentId', async () => {
  const res = await request(app).post('/api/submit/submit').send({ testType: 'reading', answers: {} });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/submit/submit rejects an invalid studentId format', async () => {
  const testDoc = await Test.create({
    title: 'Test 1',
    belongsTo: 'Book18',
    sources: [],
    answers: { reading: ['B'] }
  });

  const res = await request(app)
    .post('/api/submit/submit')
    .send({ testId: testDoc._id.toString(), testType: 'reading', studentId: 'not-an-id', answers: { 1: 'B' } });

  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Invalid studentId format. Please log in again.');
});

test('GET/POST /api/teachers/:teacherId/favorites toggles a favorited student', async () => {
  const teacher = await Teacher.create({ name: 'Mr T', username: 'teach', password: 'secret' });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const empty = await request(app).get(`/api/teachers/${teacher._id}/favorites`);
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.favoritedStudents, []);

  const added = await request(app)
    .post(`/api/teachers/${teacher._id}/favorites`)
    .send({ studentId: student._id.toString() });
  assert.equal(added.status, 200);
  assert.equal(added.body.favoritedStudents.length, 1);

  const removed = await request(app)
    .post(`/api/teachers/${teacher._id}/favorites`)
    .send({ studentId: student._id.toString() });
  assert.equal(removed.status, 200);
  assert.equal(removed.body.favoritedStudents.length, 0);
});

test('GET /api/teachers/submissions/student/:studentId formats submissions with book/test names', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  await Book.create({ name: 'Book18', tests: [{ testId: testDoc._id, testName: 'Test 1' }] });
  await TestSubmission.create({
    studentId: student._id,
    testId: testDoc._id,
    testType: 'reading',
    answers: { 1: 'B' },
    correctAnswers: { 1: 'B' },
    results: { 1: { userAnswer: 'B', correctAnswer: 'B', isCorrect: true } },
    score: 100,
    totalQuestions: 1,
    correctCount: 1
  });

  const res = await request(app).get(`/api/teachers/submissions/student/${student._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.submissions.length, 1);
  assert.equal(res.body.submissions[0].bookTitle, 'Book18');
  assert.equal(res.body.submissions[0].testName, 'Test 1');
});

test('GET /api/submissions/submission/:submissionId returns a single populated submission', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  const submission = await TestSubmission.create({
    studentId: student._id,
    testId: testDoc._id,
    testType: 'reading',
    answers: { 1: 'B' },
    correctAnswers: { 1: 'B' },
    results: { 1: { userAnswer: 'B', correctAnswer: 'B', isCorrect: true } },
    score: 100,
    totalQuestions: 1,
    correctCount: 1
  });

  const res = await request(app).get(`/api/submissions/submission/${submission._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.testId.title, 'Test 1');
});

test('GET /api/submissions/submission/:submissionId includes stored highlights', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  const submission = await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: { 1: 'B' }, correctAnswers: { 1: 'B' },
    results: { 1: { userAnswer: 'B', correctAnswer: 'B', isCorrect: true } },
    score: 100, totalQuestions: 1, correctCount: 1,
    highlights: { 'reading-passage-1': [{ start: 0, end: 6, comment: 'note' }] }
  });

  const res = await request(app).get(`/api/submissions/submission/${submission._id}`);

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.highlights, {
    'reading-passage-1': [{ start: 0, end: 6, comment: 'note' }]
  });
});

test('GET /api/submissions/submission/:submissionId is safe for a submission saved without highlights', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  // Simulate a pre-existing document written before the highlights field existed.
  const inserted = await TestSubmission.collection.insertOne({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: { 1: 'B' }, correctAnswers: { 1: 'B' },
    results: { 1: { userAnswer: 'B', correctAnswer: 'B', isCorrect: true } },
    score: 100, totalQuestions: 1, correctCount: 1, submittedAt: new Date()
  });

  const res = await request(app).get(`/api/submissions/submission/${inserted.insertedId}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.highlights, undefined);
});

test('GET /api/submissions/student/:studentId lists a student submissions newest first', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 50, totalQuestions: 1, correctCount: 0,
    submittedAt: new Date('2024-01-01')
  });
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 90, totalQuestions: 1, correctCount: 1,
    submittedAt: new Date('2024-02-01')
  });

  const res = await request(app).get(`/api/submissions/student/${student._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.length, 2);
  assert.equal(res.body[0].score, 90);
});

test('GET /api/submissions/student/:studentId/test/:testId requires a testType query param', async () => {
  const res = await request(app).get('/api/submissions/student/507f1f77bcf86cd799439011/test/507f1f77bcf86cd799439012');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'testType query parameter is required');
});

test('GET /api/submissions/student/:studentId/test/:testId returns the latest matching submission', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  // Both inside the 3-hour window the endpoint serves.
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 50, totalQuestions: 1, correctCount: 0,
    submittedAt: new Date(Date.now() - 60 * 60 * 1000)
  });
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 90, totalQuestions: 1, correctCount: 1,
    submittedAt: new Date(Date.now() - 5 * 60 * 1000)
  });

  const res = await request(app)
    .get(`/api/submissions/student/${student._id}/test/${testDoc._id}`)
    .query({ testType: 'reading' });

  assert.equal(res.status, 200);
  assert.equal(res.body.score, 90);
});

test('GET /api/submissions/student/:studentId/test/:testId includes highlights', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'listening',
    answers: {}, correctAnswers: {}, results: {}, score: 90, totalQuestions: 1, correctCount: 1,
    highlights: { 'listening-questions-2': [{ start: 1, end: 3, id: 'h9' }] }
  });

  const res = await request(app)
    .get(`/api/submissions/student/${student._id}/test/${testDoc._id}`)
    .query({ testType: 'listening' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.highlights, {
    'listening-questions-2': [{ start: 1, end: 3, id: 'h9' }]
  });
});

test('GET /api/submissions/:testId lists submissions for a test with student names and highlights', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 90, totalQuestions: 1, correctCount: 1,
    highlights: { 'reading-passage-1': [{ start: 0, end: 4 }] }
  });

  const res = await request(app).get(`/api/submissions/${testDoc._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.submissions.length, 1);
  assert.equal(res.body.submissions[0].studentName, 'Ann');
  assert.deepEqual(res.body.submissions[0].highlights, {
    'reading-passage-1': [{ start: 0, end: 4 }]
  });
});

test('GET /api/submissions/:testId defaults highlights to an empty object when the field is absent', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  await TestSubmission.collection.insertOne({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 90, totalQuestions: 1, correctCount: 1,
    submittedAt: new Date()
  });

  const res = await request(app).get(`/api/submissions/${testDoc._id}`);

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.submissions[0].highlights, {});
});

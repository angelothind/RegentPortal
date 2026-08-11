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

test('GET /api/submit/test confirms the submit router is mounted', async () => {
  const res = await request(app).get('/api/submit/test');
  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Submit test route is working');
});

test('POST /api/submit/test-submission returns the fixed debug payload', async () => {
  const res = await request(app).post('/api/submit/test-submission').send({ any: 'thing' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.score, 85);
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

test('POST /api/submit/submit 500s when answers is missing (pre-existing behavior)', async () => {
  // The handler logs `Object.keys(answers).length` before validating required
  // fields, so a missing `answers` throws and falls into the catch-all 500
  // handler instead of the 400 validation response. This refactor preserves
  // that existing behavior rather than silently fixing it.
  const res = await request(app).post('/api/submit/submit').send({ testType: 'reading' });

  assert.equal(res.status, 500);
  assert.equal(res.body.success, false);
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

  const res = await request(app)
    .get(`/api/submissions/student/${student._id}/test/${testDoc._id}`)
    .query({ testType: 'reading' });

  assert.equal(res.status, 200);
  assert.equal(res.body.score, 90);
});

test('GET /api/submissions/:testId lists submissions for a test with student names', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });
  await TestSubmission.create({
    studentId: student._id, testId: testDoc._id, testType: 'reading',
    answers: {}, correctAnswers: {}, results: {}, score: 90, totalQuestions: 1, correctCount: 1
  });

  const res = await request(app).get(`/api/submissions/${testDoc._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.submissions.length, 1);
  assert.equal(res.body.submissions[0].studentName, 'Ann');
});

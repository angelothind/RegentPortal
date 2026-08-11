const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnvironment, stopTestEnvironment, clearDatabase } = require('./setup');

const Book = require('../models/Book');
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

test('GET /api/books returns a raw array with populated test references', async () => {
  const testDoc = await Test.create({ title: 'Test 1', belongsTo: 'Book18', sources: [] });
  await Book.create({ name: 'Book18', tests: [{ testId: testDoc._id, testName: 'Test 1' }] });

  const res = await request(app).get('/api/books');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name, 'Book18');
  assert.equal(res.body[0].tests[0].testId.title, 'Test 1');
});

test('GET /api/books returns an empty array when there are no books', async () => {
  const res = await request(app).get('/api/books');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, []);
});

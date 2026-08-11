const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnvironment, stopTestEnvironment } = require('./setup');

let app;

before(async () => {
  app = await startTestEnvironment();
});

after(async () => {
  await stopTestEnvironment();
});

test('GET /api/health returns OK status envelope', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
  assert.equal(res.body.message, 'Regent Portal API is running');
});

test('GET / is shadowed by the built client bundle (pre-existing behavior)', async () => {
  // The static client/dist middleware is registered before the health route,
  // so it serves index.html instead of the JSON health payload. This is
  // existing production behavior that the refactor intentionally preserves.
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/html/);
});

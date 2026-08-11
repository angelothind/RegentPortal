const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnvironment, stopTestEnvironment, clearDatabase } = require('./setup');

const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

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

test('POST /api/user/login succeeds for a Student and returns a token', async () => {
  await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'ann', password: 'secret', userType: 'Student' });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Login successful');
  assert.equal(res.body.user.username, 'ann');
  assert.equal(res.body.user.userType, 'Student');
  assert.ok(res.body.token);
});

test('POST /api/user/login rejects a wrong Student password', async () => {
  await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'ann', password: 'wrong', userType: 'Student' });

  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Invalid password');
});

test('POST /api/user/login 404s for an unknown Student', async () => {
  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'ghost', password: 'secret', userType: 'Student' });

  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Student not found');
});

test('POST /api/user/login logs a Teacher in as Teacher userType', async () => {
  await Teacher.create({ name: 'Mr T', username: 'teach', password: 'secret' });

  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'teach', password: 'secret', userType: 'Teacher' });

  assert.equal(res.status, 200);
  assert.equal(res.body.user.userType, 'Teacher');
});

test('POST /api/user/login checks Admin first for userType Teacher and reports userType Admin', async () => {
  await Admin.create({ username: 'root', password: 'secret' });

  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'root', password: 'secret', userType: 'Teacher' });

  assert.equal(res.status, 200);
  assert.equal(res.body.user.userType, 'Admin');
});

test('POST /api/user/login 404s for an unknown Teacher', async () => {
  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'ghost', password: 'secret', userType: 'Teacher' });

  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Teacher not found');
});

test('POST /api/user/login rejects an invalid userType', async () => {
  const res = await request(app)
    .post('/api/user/login')
    .send({ username: 'ann', password: 'secret', userType: 'Robot' });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid user type');
});

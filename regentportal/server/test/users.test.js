const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { startTestEnvironment, stopTestEnvironment, clearDatabase } = require('./setup');

const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

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

test('POST /api/create/createadmin creates an admin', async () => {
  const res = await request(app)
    .post('/api/create/createadmin')
    .send({ username: 'root', password: 'secret' });

  assert.equal(res.status, 201);
  assert.equal(res.body.username, 'root');
  assert.ok(await Admin.findOne({ username: 'root' }));
});

test('POST /api/create/createadmin rejects a duplicate username', async () => {
  await Admin.create({ username: 'root', password: 'secret' });

  const res = await request(app)
    .post('/api/create/createadmin')
    .send({ username: 'root', password: 'secret' });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Admin already exists');
});

test('POST /api/create/createstudent creates a student', async () => {
  const res = await request(app)
    .post('/api/create/createstudent')
    .send({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  assert.equal(res.status, 201);
  assert.equal(res.body.message, 'Student created');
  assert.ok(res.body._id);
});

test('POST /api/create/createteacher creates a teacher', async () => {
  const res = await request(app)
    .post('/api/create/createteacher')
    .send({ name: 'Mr T', username: 'teach', password: 'secret' });

  assert.equal(res.status, 201);
  assert.equal(res.body.username, 'teach');
});

test('GET /api/lookup/lookupstudents lists students by name/nickname/username', async () => {
  await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const res = await request(app).get('/api/lookup/lookupstudents');

  assert.equal(res.status, 200);
  assert.equal(res.body.students.length, 1);
  assert.equal(res.body.students[0].username, 'ann');
  assert.equal(res.body.students[0].password, undefined);
});

test('GET /api/lookup/lookupteachers lists teachers', async () => {
  await Teacher.create({ name: 'Mr T', username: 'teach', password: 'secret' });

  const res = await request(app).get('/api/lookup/lookupteachers');

  assert.equal(res.status, 200);
  assert.equal(res.body.teachers.length, 1);
});

test('GET /api/lookup/lookupadmins lists admins', async () => {
  await Admin.create({ username: 'root', password: 'secret' });

  const res = await request(app).get('/api/lookup/lookupadmins');

  assert.equal(res.status, 200);
  assert.equal(res.body.admins.length, 1);
});

test('DELETE /api/delete/deletestudent/:id deletes an existing student', async () => {
  const student = await Student.create({ name: 'Ann', nickname: 'A', username: 'ann', password: 'secret' });

  const res = await request(app).delete(`/api/delete/deletestudent/${student._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Student deleted successfully');
  assert.equal(await Student.findById(student._id), null);
});

test('DELETE /api/delete/deletestudent/:id 404s for an unknown id', async () => {
  const fakeId = '507f1f77bcf86cd799439011';
  const res = await request(app).delete(`/api/delete/deletestudent/${fakeId}`);

  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Student not found');
});

test('DELETE /api/delete/deleteteacher/:id deletes an existing teacher', async () => {
  const teacher = await Teacher.create({ name: 'Mr T', username: 'teach', password: 'secret' });

  const res = await request(app).delete(`/api/delete/deleteteacher/${teacher._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Teacher deleted successfully');
});

test('DELETE /api/delete/deleteadmin/:id deletes an existing admin', async () => {
  const admin = await Admin.create({ username: 'root', password: 'secret' });

  const res = await request(app).delete(`/api/delete/deleteadmin/${admin._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Admin deleted successfully');
});

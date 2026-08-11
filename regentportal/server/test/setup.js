// test/setup.js
// Shared helpers for isolated contract tests: an in-memory MongoDB instance
// and the Express app, wired together the same way server.js does in
// production but without touching the real MONGO_URI.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

async function startTestEnvironment() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Required lazily so no route/model connects to the dev database on import.
  app = require('../app');
  return app;
}

async function stopTestEnvironment() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

async function clearDatabase() {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}

module.exports = { startTestEnvironment, stopTestEnvironment, clearDatabase };

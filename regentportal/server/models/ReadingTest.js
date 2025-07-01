const mongoose = require('mongoose');
const Test = require('./Test');

const readingTestSchema = new mongoose.Schema({
  text: [{ type: String, required: true }],
  questions: { type: String, required: true },
  answers: { type: String, required: true }
});

module.exports = Test.discriminator('ReadingTest', readingTestSchema);
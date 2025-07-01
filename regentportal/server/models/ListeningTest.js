const mongoose = require('mongoose');
const Test = require('./Test');

const listeningTestSchema = new mongoose.Schema({
  audio: [{ type: String, required: true }], // file URL or path
  questions: { type: String, required: true },
  answers: { type: String, required: true }
});

module.exports = Test.discriminator('ListeningTest', listeningTestSchema);
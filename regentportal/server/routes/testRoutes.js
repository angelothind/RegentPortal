// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { createReadingTest } = require('../controllers/testController');

router.post('/reading', createReadingTest);

router.get('/ping', (req, res) => {
  console.log('✅ /ping route hit');
  res.send('pong');
});
module.exports = router;
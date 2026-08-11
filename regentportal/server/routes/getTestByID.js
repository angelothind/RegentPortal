// routes/getTestById.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/:testId', testController.getTestById);

module.exports = router;

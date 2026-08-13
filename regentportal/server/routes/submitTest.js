const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// POST /api/submit/submit
router.post('/submit', submissionController.submitTest);

module.exports = router;

const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// POST /api/submit/submit
router.post('/submit', submissionController.submitTest);

// POST /api/submit/grade — grade only, no TestSubmission
router.post('/grade', submissionController.gradeTest);

module.exports = router;

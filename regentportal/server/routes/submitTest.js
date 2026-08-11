const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Test endpoint to verify route is working
router.get('/test', submissionController.healthCheck);

// Test submission endpoint for debugging
router.post('/test-submission', submissionController.debugSubmission);

// POST /api/submit/submit
router.post('/submit', submissionController.submitTest);

module.exports = router;

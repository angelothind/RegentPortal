const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Get a specific submission by ID with complete details (MUST come first)
router.get('/submission/:submissionId', submissionController.getSubmissionById);

// Get all submissions for a student
router.get('/student/:studentId', submissionController.getStudentSubmissions);

// Get most recent submission for a specific student and test (MUST come before /:testId)
// Query parameter: testType (required) - 'reading' or 'listening'
router.get('/student/:studentId/test/:testId', submissionController.getLatestStudentTestSubmission);

// Get all submissions for a specific test (MUST come last) - TEACHERS ONLY
router.get('/:testId', submissionController.getTestSubmissions);

module.exports = router;

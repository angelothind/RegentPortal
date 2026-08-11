const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/:id/reading', testController.getReadingContent);

router.get('/:id/listening', testController.getListeningContent);

router.get('/:id/questions/:part', testController.getQuestionsForPart);

module.exports = router;

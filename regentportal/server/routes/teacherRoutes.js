const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Get teacher's favorited students
router.get('/:teacherId/favorites', teacherController.getFavorites);

// Toggle favorite student
router.post('/:teacherId/favorites', teacherController.toggleFavorite);

// Get student submissions for a specific student
router.get('/submissions/student/:studentId', teacherController.getStudentSubmissionsForTeacher);

module.exports = router;

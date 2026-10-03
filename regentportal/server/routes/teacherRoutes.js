const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireTeacherOrAdmin } = require('../utils/authToken');

// Get teacher's favorited students
router.get('/:teacherId/favorites', teacherController.getFavorites);

// Toggle favorite student
router.post('/:teacherId/favorites', teacherController.toggleFavorite);

// Get student submissions for a specific student (teacher or admin token required)
router.get('/submissions/student/:studentId', requireTeacherOrAdmin, teacherController.getStudentSubmissionsForTeacher);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const teacherController = require('../controllers/teacherController');

router.post('/createadmin', adminController.createAdmin);
router.post('/createstudent', studentController.createStudent);
router.post('/createteacher', teacherController.createTeacher);

module.exports = router;

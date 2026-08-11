const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const teacherController = require('../controllers/teacherController');

// DELETE an admin by ID
router.delete('/deleteadmin/:id', adminController.deleteAdmin);

router.delete('/deletestudent/:id', studentController.deleteStudent);

router.delete('/deleteteacher/:id', teacherController.deleteTeacher);

module.exports = router;

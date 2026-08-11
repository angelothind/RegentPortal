// routes/lookupRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const teacherController = require('../controllers/teacherController');
const adminController = require('../controllers/adminController');

router.get('/lookupstudents', studentController.listStudents);
router.get('/lookupteachers', teacherController.listTeachers);
router.get('/lookupadmins', adminController.listAdmins);

module.exports = router;

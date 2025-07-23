// routes/lookupRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // adjust path if needed
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

router.get('/lookupstudents', async (req, res) => {
    console.log('In lookupstudents route');
    try {
        const students = await Student.find({}, 'name username'); // only return name + username
        res.json({ students });
    } catch (err) {
        console.error('❌ Error fetching students:', err);
        res.status(500).json({ error: 'Server error' });
    }
    });

router.get('/lookupteachers', async (req, res) => {
    console.log('In lookupteachers route');
    try {
        const teachers = await Teacher.find({}, 'name username');
        res.json({ teachers });
    } catch (err) {
        console.error('❌ Error fetching teachers:', err);
        res.status(500).json({ error: 'Server error' });
    }
    });


router.get('/lookupadmins', async (req, res) => {
    console.log('In lookupadmins route');
    try {
        const admins = await Admin.find({}, 'username');
        console.log('Found admins:', admins);
        res.json({ admins });
    } catch (err) {
        console.error('❌ Error fetching admins:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;

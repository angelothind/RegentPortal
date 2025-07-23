const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

router.post('/createadmin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', username: newAdmin.username });

  } catch (err) {
    console.error('❌ Error creating admin:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/createstudent', async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student already exists' });
    }
    
    const newStudent = new Student({ name, username, password});

    await newStudent.save();
    res.status(201).json({ message: 'Student created', _id: newStudent._id });
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/createteacher', async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existing = await Teacher.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Teacher already exists' });

    const newTeacher = new Teacher({ name, username, password });
    await newTeacher.save();

    res.status(201).json({ message: 'Teacher created', _id: newTeacher._id, username });
  } catch (err) {
    console.error('❌ Error creating teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
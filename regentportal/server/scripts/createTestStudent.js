// server/scripts/createTestStudent.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');

const createTestStudent = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Create a simple test student
    const testStudent = new Student({
      name: 'Test Student',
      username: 'student',
      password: 'password',
      givenAnswers: []
    });

    await testStudent.save();
    console.log('✅ Test student created successfully!');
    console.log('Username: student');
    console.log('Password: password');

    // Verify the student was created
    const foundStudent = await Student.findOne({ username: 'student' });
    console.log('✅ Student found in database:', foundStudent.username);

  } catch (err) {
    console.error('❌ Error creating test student:', err);
  } finally {
    mongoose.connection.close();
  }
};

createTestStudent(); 
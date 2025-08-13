// server/scripts/checkStudentPasswords.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const bcrypt = require('bcrypt');

const checkStudentPasswords = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(`📊 Found ${students.length} students in database`);
    
    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    // Check each student's password
    for (const student of students) {
      console.log(`\n👤 Student: ${student.username}`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Password hash: ${student.password.substring(0, 20)}...`);
      
      // Test password matching
      const testPassword = student.username; // password should be same as username
      const isMatch = await bcrypt.compare(testPassword, student.password);
      console.log(`   Password '${testPassword}' matches: ${isMatch ? '✅ YES' : '❌ NO'}`);
      
      // Also test with 'password123' in case that was used
      const testPassword2 = 'password123';
      const isMatch2 = await bcrypt.compare(testPassword2, student.password);
      console.log(`   Password '${testPassword2}' matches: ${isMatch2 ? '✅ YES' : '❌ NO'}`);
    }

  } catch (err) {
    console.error('❌ Error checking student passwords:', err);
  } finally {
    mongoose.connection.close();
  }
};

checkStudentPasswords(); 
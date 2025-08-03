// server/scripts/createStudents.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');

const createStudents = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing students
    await Student.deleteMany({});
    console.log('🧹 Cleared existing students');

    // Create students
    const students = [
      {
        name: 'John Doe',
        username: 'john.doe',
        password: 'password123'
      },
      {
        name: 'Student ',
        username: 'student',
        password: 'password123'
      },
      {
        name: 'Bob Johnson',
        username: 'bob.johnson',
        password: 'password123'
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log('✅ Students created:', createdStudents.length);

    // Verify the data
    const allStudents = await Student.find({});
    console.log('📊 Verification:');
    console.log('- Students in DB:', allStudents.length);
    console.log('- Student names:', allStudents.map(s => s.name));
    
    console.log('✅ Student creation completed successfully!');
  } catch (err) {
    console.error('❌ Error creating students:', err);
  } finally {
    mongoose.connection.close();
  }
};

createStudents(); 
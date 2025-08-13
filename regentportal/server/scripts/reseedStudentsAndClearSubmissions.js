// server/scripts/reseedStudentsAndClearSubmissions.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const TestSubmission = require('../models/TestSubmission');

const reseedStudentsAndClearSubmissions = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear all test submissions first
    const submissionResult = await TestSubmission.deleteMany({});
    console.log(`🧹 Cleared ${submissionResult.deletedCount} test submissions`);

    // Clear existing students
    const studentResult = await Student.deleteMany({});
    console.log(`🧹 Cleared ${studentResult.deletedCount} existing students`);

    // Create 3 new students with simple usernames/passwords
    const students = [
      {
        name: 'Student One',
        username: 'student1',
        password: 'student1'
      },
      {
        name: 'Student Two',
        username: 'student2',
        password: 'student2'
      },
      {
        name: 'Student Three',
        username: 'student3',
        password: 'student3'
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log('✅ Students created:', createdStudents.length);

    // Verify the data
    const allStudents = await Student.find({});
    const allSubmissions = await TestSubmission.find({});
    
    console.log('📊 Verification:');
    console.log('- Students in DB:', allStudents.length);
    console.log('- Student usernames:', allStudents.map(s => s.username));
    console.log('- Test submissions in DB:', allSubmissions.length);
    
    console.log('✅ Student reseeding and submission clearing completed successfully!');
    console.log('📝 Login credentials:');
    allStudents.forEach(student => {
      console.log(`   Username: ${student.username}, Password: ${student.username}`);
    });
    
  } catch (err) {
    console.error('❌ Error reseeding students and clearing submissions:', err);
  } finally {
    mongoose.connection.close();
  }
};

reseedStudentsAndClearSubmissions(); 
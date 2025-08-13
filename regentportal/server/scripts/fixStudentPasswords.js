// server/scripts/fixStudentPasswords.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const TestSubmission = require('../models/TestSubmission');
const bcrypt = require('bcrypt');

const fixStudentPasswords = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear all test submissions first
    const submissionResult = await TestSubmission.deleteMany({});
    console.log(`🧹 Cleared ${submissionResult.deletedCount} test submissions`);

    // Clear existing students
    const studentResult = await Student.deleteMany({});
    console.log(`🧹 Cleared ${studentResult.deletedCount} existing students`);

    // Create students one by one to ensure password hashing works
    const studentData = [
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

    console.log('🔐 Creating students with proper password hashing...');
    
    for (const studentInfo of studentData) {
      const student = new Student(studentInfo);
      await student.save(); // This will trigger the pre-save middleware
      console.log(`✅ Created student: ${studentInfo.username}`);
    }

    // Verify the passwords are properly hashed
    console.log('\n🔍 Verifying password hashing...');
    const allStudents = await Student.find({});
    
    for (const student of allStudents) {
      console.log(`\n👤 Student: ${student.username}`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Password hash: ${student.password.substring(0, 20)}...`);
      
      // Test password matching
      const testPassword = student.username;
      const isMatch = await bcrypt.compare(testPassword, student.password);
      console.log(`   Password '${testPassword}' matches: ${isMatch ? '✅ YES' : '❌ NO'}`);
      
      if (!isMatch) {
        console.log(`   ❌ WARNING: Password for ${student.username} is not working!`);
      }
    }

    console.log('\n📊 Final verification:');
    console.log('- Students in DB:', allStudents.length);
    console.log('- Student usernames:', allStudents.map(s => s.username));
    
    const allSubmissions = await TestSubmission.find({});
    console.log('- Test submissions in DB:', allSubmissions.length);
    
    console.log('\n✅ Student password fixing completed!');
    console.log('📝 Login credentials:');
    allStudents.forEach(student => {
      console.log(`   Username: ${student.username}, Password: ${student.username}`);
    });
    
  } catch (err) {
    console.error('❌ Error fixing student passwords:', err);
  } finally {
    mongoose.connection.close();
  }
};

fixStudentPasswords(); 
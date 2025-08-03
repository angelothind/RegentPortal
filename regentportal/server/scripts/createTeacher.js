// server/scripts/createTeacher.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Teacher = require('../models/Teacher');

const createTeacher = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing teachers
    await Teacher.deleteMany({});
    console.log('🧹 Cleared existing teachers');

    // Create teacher
    const teacher = new Teacher({
      name: 'Teacher Test',
      username: 'teacher.test',
      password: 'password123',
      favoritedStudents: []
    });

    await teacher.save();
    console.log('✅ Teacher created:', teacher.name);

    // Verify the data
    const allTeachers = await Teacher.find({});
    console.log('📊 Verification:');
    console.log('- Teachers in DB:', allTeachers.length);
    console.log('- Teacher names:', allTeachers.map(t => t.name));
    
    console.log('✅ Teacher creation completed successfully!');
  } catch (err) {
    console.error('❌ Error creating teacher:', err);
  } finally {
    mongoose.connection.close();
  }
};

createTeacher(); 
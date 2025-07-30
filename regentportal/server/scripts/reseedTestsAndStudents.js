// server/scripts/reseedTestsAndStudents.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');
const Student = require('../models/Student');

const reseedTestsAndStudents = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing tests and students
    await Test.deleteMany({});
    await Student.deleteMany({});
    console.log('🧹 Cleared existing tests and students');

    // Seed tests with new Map structure for answers
    const tests = [
      {
        title: 'Test 1',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test1/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book19/Test1/audios/fullaudio.mp3'
          }
        ],
        answers: {
          "1": ["A", "a"],
          "2": ["B", "b"],
          "3": ["C", "c"],
          "4": ["tennis", "tennis racket", "racket modifications"],
          "5": ["five", "5", "fifth"]
        }
      },
      {
        title: 'Test 2',
        sources: [
          {
            name: 'passage1',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage1.json'
          },
          {
            name: 'passage2',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage2.json'
          },
          {
            name: 'passage3',
            sourceType: 'Reading',
            contentPath: 'Books/Book19/Test2/passages/passage3.json'
          },
          {
            name: 'audio1',
            sourceType: 'Listening',
            contentPath: 'Books/Book19/Test2/audios/fullaudio.mp3'
          }
        ],
        answers: {
          "1": ["D", "d"],
          "2": ["E", "e"],
          "3": ["F", "f"],
          "4": ["pirates", "mediterranean pirates", "ancient pirates"],
          "5": ["rome", "roman", "pompey"]
        }
      }
    ];

    const createdTests = await Test.insertMany(tests);
    console.log('✅ Tests seeded with new Map structure:', createdTests.length);

    // Seed students with new testId references
    const students = [
      {
        name: 'John Doe',
        username: 'john.doe',
        password: 'password123',
        givenAnswers: [
          {
            testId: createdTests[0]._id, // Test 1
            answers: ["A", "B", "C", "tennis", "five"]
          }
        ]
      },
      {
        name: 'Jane Smith',
        username: 'jane.smith',
        password: 'password123',
        givenAnswers: [
          {
            testId: createdTests[0]._id, // Test 1
            answers: ["A", "B", "C", "tennis racket", "5"]
          },
          {
            testId: createdTests[1]._id, // Test 2
            answers: ["D", "E", "F", "pirates", "rome"]
          }
        ]
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log('✅ Students seeded with new testId references:', createdStudents.length);

    // Verify the data
    const allTests = await Test.find({});
    const allStudents = await Student.find({}).populate('givenAnswers.testId');
    
    console.log('📊 Verification:');
    console.log('- Tests in DB:', allTests.length);
    console.log('- Students in DB:', allStudents.length);
    console.log('- Test 1 answers structure:', allTests[0].answers);
    console.log('- Student 1 given answers:', allStudents[0].givenAnswers);
    
    console.log('✅ Reseeding completed successfully!');
  } catch (err) {
    console.error('❌ Error reseeding:', err);
  } finally {
    mongoose.connection.close();
  }
};

reseedTestsAndStudents(); 
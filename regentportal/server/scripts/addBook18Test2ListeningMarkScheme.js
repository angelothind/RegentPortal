require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');

const addBook18Test2ListeningMarkScheme = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const test2 = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });
    if (!test2) {
      console.log('❌ Test 2 Book 18 not found');
      return;
    }
    
    console.log('📝 Found Test 2 Book 18, adding Listening mark scheme...');
    
    // Test 2 Listening Answers (Questions 1-40) - Updated with arrays for optional parts
    const test2ListeningAnswers = [
      // Part 1 (Questions 1-10): 10 answers
      "receptionist", "Medical", "Chastons", "appointments", "database", "experience", "confident", "temporary", "1.15", "parking",
      
      // Part 2 (Questions 11-20): 10 answers
      "B", "A", "A", "C", "F", "G", "E", "A", "C", "B",
      
      // Part 3 (Questions 21-30): 10 answers
      ["B", "D"], ["B", "D"], "D", "A", "C", "G", "F", "A", "B", "C",
      
      // Part 4 (Questions 31-40): 10 answers - Updated with arrays for optional parts
      "plot", "poverty", "Europe", "poetry", "drawings", "furniture", "lamps", ["harbour", "harbor"], "children", "relatives"
    ];
    
    if (test2ListeningAnswers.length !== 40) {
      console.log(`❌ Error: Listening answers count is ${test2ListeningAnswers.length}, should be 40`);
      return;
    }
    
    let answersMap = test2.answers || new Map();
    answersMap.set('listening', test2ListeningAnswers);
    test2.answers = answersMap;
    
    await test2.save();
    
    console.log('✅ Successfully added Listening mark scheme for Book 18 Test 2');
    console.log(`🎵 Listening: ${test2ListeningAnswers.length} answers`);
    
    // Verify the answers were saved correctly
    const updatedTest = await Test.findOne({ title: 'Test 2', belongsTo: 'Book18' });
    const savedAnswers = updatedTest.answers.get('listening');
    
    if (savedAnswers && savedAnswers.length === 40) {
      console.log('✅ Verification: All 40 listening answers saved successfully');
      console.log('📋 Sample answers:');
      console.log(`   Q1: ${savedAnswers[0]}`);
      console.log(`   Q21-22: ${savedAnswers[20]} (multiple choice two)`);
      console.log(`   Q36: ${savedAnswers[35]} (optional plural)`);
      console.log(`   Q37: ${savedAnswers[36]} (optional plural)`);
      console.log(`   Q38: ${savedAnswers[37]} (spelling variation)`);
    } else {
      console.log('❌ Verification failed: Answers not saved correctly');
    }
    
  } catch (err) {
    console.error('❌ Error adding listening mark scheme:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addBook18Test2ListeningMarkScheme(); 
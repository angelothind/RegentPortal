// scripts/updateTest2Answers.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const updateTest2Answers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 2
    const test2 = await Test.findOne({ title: 'Test 2' });
    if (!test2) {
      console.log('❌ Test 2 not found in database');
      return;
    }

    console.log('📝 Found Test 2:', test2.title);

    // Update Test 2 with the correct answers from the mark scheme
    const updatedAnswers = {
      // Reading Passage 1, Questions 1-13
      "1": "piston",
      "2": "coal", 
      "3": "workshops",
      "4": "labour", // or "labor" - both acceptable
      "5": "quality",
      "6": "railway", // or "railways" - both acceptable
      "7": "sanitation",
      "8": "NOT GIVEN",
      "9": "FALSE",
      "10": "NOT GIVEN",
      "11": "TRUE",
      "12": "TRUE",
      "13": "NOT GIVEN",
      
      // Reading Passage 2, Questions 14-26
      "14": "D",
      "15": "F",
      "16": "A",
      "17": "C",
      "18": "F",
      "19": "injury",
      "20": "serves",
      "21": "excitement",
      "22": "Visualisation", // or "Visualization" - both acceptable
      "23": ["B", "D"], // IN EITHER ORDER
      "24": ["B", "D"], // IN EITHER ORDER
      "25": ["A", "E"], // IN EITHER ORDER
      "26": ["A", "E"], // IN EITHER ORDER
      
      // Reading Passage 3, Questions 27-40
      "27": "H",
      "28": "A",
      "29": "C",
      "30": "B",
      "31": "J",
      "32": "I",
      "33": "YES",
      "34": "NOT GIVEN",
      "35": "YES",
      "36": "NOT GIVEN",
      "37": "NO",
      "38": "C",
      "39": "B",
      "40": "D"
    };

    // Update the test with the answers
    test2.answers = updatedAnswers;
    await test2.save();

    console.log('✅ Updated Test 2 with correct answers from mark scheme');
    console.log('📊 Total answers added:', Object.keys(updatedAnswers).length);
    
    // Verify the update
    const updatedTest = await Test.findOne({ title: 'Test 2' });
    console.log('🔍 Verification - Test 2 answers count:', updatedTest.answers.size);
    console.log('🔍 Sample answers:');
    console.log('  Question 1:', updatedTest.answers.get('1'));
    console.log('  Question 8:', updatedTest.answers.get('8'));
    console.log('  Question 23:', updatedTest.answers.get('23'));

  } catch (err) {
    console.error('❌ Error updating Test 2 answers:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateTest2Answers(); 
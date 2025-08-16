// server/scripts/updateTest3Reading.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const updateTest3Reading = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 3
    const test3 = await Test.findOne({ title: 'Test 3' });
    if (!test3) {
      console.log('❌ Test 3 not found');
      return;
    }

    console.log('✅ Found Test 3, updating with reading answers...');

    // Update Test 3 with reading answers
    // Note: Reading questions 1-40 will replace listening questions 1-40
    // In a real test, these would be separate sections, but for now we'll update the existing answers
    
    const updatedAnswers = {
      // Reading Passage 1 - Questions 1-13
      "1": "FALSE",
      "2": "FALSE", 
      "3": "TRUE",
      "4": "NOT GIVEN",
      "5": "TRUE",
      "6": "NOT GIVEN",
      "7": "FALSE",
      "8": "caves",
      "9": "stone",
      "10": "bones",
      "11": "beads",
      "12": "pottery",
      "13": "spices",
      
      // Reading Passage 2 - Questions 14-26
      "14": "G",
      "15": "A",
      "16": "H",
      "17": "B",
      "18": "carbon",
      "19": "fires",
      "20": "biodiversity",
      "21": "ditches",
      "22": "subsidence",
      "23": "A",
      "24": "C",
      "25": "D",
      "26": "B",
      
      // Reading Passage 3 - Questions 27-40
      "27": "D",
      "28": "A",
      "29": "C",
      "30": "B",
      "31": "C",
      "32": "E",
      "33": "F",
      "34": "B",
      "35": "NO",
      "36": "YES",
      "37": "NO",
      "38": "NOT GIVEN",
      "39": "NOT GIVEN",
      "40": "YES"
    };

    // Update the answers
    test3.answers = updatedAnswers;
    await test3.save();

    console.log('✅ Test 3 updated with reading answers');
    console.log('📊 Total answers:', Object.keys(updatedAnswers).length);
    
    // Verify the update
    const updatedTest3 = await Test.findOne({ title: 'Test 3' });
    console.log('📝 Verification - Sample answers:');
    console.log('Question 1:', updatedTest3.answers.get('1'));
    console.log('Question 14:', updatedTest3.answers.get('14'));
    console.log('Question 27:', updatedTest3.answers.get('27'));
    console.log('Question 40:', updatedTest3.answers.get('40'));
    
    console.log('✅ Test 3 reading update completed successfully!');
  } catch (err) {
    console.error('❌ Error updating Test 3 reading:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateTest3Reading(); 
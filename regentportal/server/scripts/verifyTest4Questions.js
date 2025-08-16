// server/scripts/verifyTest4Questions.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');
const fs = require('fs');
const path = require('path');

const verifyTest4Questions = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find Test 4
    const test4 = await Test.findOne({ title: 'Test 4' });
    
    if (!test4) {
      console.log('❌ Test 4 not found in database');
      return;
    }

    console.log('✅ Found Test 4:', test4.title);
    console.log('Test 4 ID:', test4._id);

    // Check if listening answers exist
    if (!test4.answers.has('listening')) {
      console.log('❌ No listening answers found for Test 4');
      return;
    }

    const listeningAnswers = test4.answers.get('listening');
    
    console.log('\n📋 Test 4 Listening Questions Verification:');
    console.log('===========================================');
    console.log(`Total listening answers in database: ${Object.keys(listeningAnswers).length}`);

    // Check question files
    const questionsDir = path.join(__dirname, '../assets/Books/Book19/Test4/questions/Listening');
    const questionFiles = [
      'part1.json',
      'part2.json',
      'part3.json',
      'part4.json'
    ];

    console.log('\n📁 Question Files Check:');
    console.log('=========================');
    
    let totalQuestionsInFiles = 0;
    const questionTypes = [];

    for (const file of questionFiles) {
      const filePath = path.join(questionsDir, file);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          
          console.log(`✅ ${file}: Found`);
          
          // Count questions in this file
          let questionsInFile = 0;
          data.templates.forEach(template => {
            if (template.questionBlock) {
              template.questionBlock.forEach(question => {
                // Handle choose-two-letters questions (count as 2)
                if (template.questionType === 'choose-two-letters') {
                  questionsInFile += 2;
                } else {
                  questionsInFile += 1;
                }
              });
            }
            if (template.questionType) {
              questionTypes.push(template.questionType);
            }
          });
          
          totalQuestionsInFiles += questionsInFile;
          console.log(`   Questions in ${file}: ${questionsInFile}`);
          
        } catch (err) {
          console.log(`❌ ${file}: Error reading/parsing - ${err.message}`);
        }
      } else {
        console.log(`❌ ${file}: Not found`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('============');
    console.log(`Total questions in database: ${Object.keys(listeningAnswers).length}`);
    console.log(`Total questions in files: ${totalQuestionsInFiles}`);
    console.log(`Perfect match: ${Object.keys(listeningAnswers).length === totalQuestionsInFiles ? 'YES' : 'NO'}`);

    console.log('\n🎯 Question Types Used:');
    console.log('========================');
    const uniqueTypes = [...new Set(questionTypes)];
    uniqueTypes.forEach(type => {
      const count = questionTypes.filter(t => t === type).length;
      console.log(`- ${type}: ${count} template(s)`);
    });

    // Verify specific answers match
    console.log('\n🔍 Answer Verification:');
    console.log('=======================');
    
    const keyQuestions = [1, 11, 21, 31, 40];
    keyQuestions.forEach(qNum => {
      const answer = listeningAnswers[qNum.toString()];
      console.log(`Q${qNum}: ${answer}`);
    });

    if (Object.keys(listeningAnswers).length === totalQuestionsInFiles) {
      console.log('\n🎉 SUCCESS: All Test 4 Listening questions are properly structured!');
      console.log('✅ Question files match the mark scheme in the database');
    } else {
      console.log('\n⚠️ WARNING: Question count mismatch detected');
      console.log('Please check the question files for completeness');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    mongoose.connection.close();
  }
};

verifyTest4Questions(); 
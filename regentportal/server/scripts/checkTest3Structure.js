// server/scripts/checkTest3Structure.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Test = require('../models/Test');
const fs = require('fs');
const path = require('path');

const checkTest3Structure = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check Test 3 structure
    const test3 = await Test.findOne({ title: 'Test 3' });
    
    if (!test3) {
      console.log('❌ Test 3 not found in database');
      return;
    }

    console.log('✅ Found Test 3:', test3.title);
    console.log('Test 3 ID:', test3._id);

    // Check if listening answers exist
    if (!test3.answers.has('listening')) {
      console.log('❌ No listening answers found for Test 3');
      return;
    }

    const listeningAnswers = test3.answers.get('listening');
    
    console.log('\n📋 Test 3 Listening Answers:');
    console.log('============================');
    console.log(`Total listening answers: ${Object.keys(listeningAnswers).length}`);

    // Check question files
    const questionsDir = path.join(__dirname, '../assets/Books/Book19/Test3/questions/Listening');
    const questionFiles = [
      'part1.json',
      'part2.json',
      'part3.json',
      'part4.json'
    ];

    console.log('\n📁 Test 3 Question Files Structure:');
    console.log('====================================');
    
    for (const file of questionFiles) {
      const filePath = path.join(questionsDir, file);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          
          console.log(`\n📄 ${file}:`);
          console.log(`   Templates: ${data.templates.length}`);
          
          data.templates.forEach((template, index) => {
            console.log(`   Template ${index + 1}:`);
            console.log(`     Type: ${template.questionType}`);
            console.log(`     Question Block Length: ${template.questionBlock ? template.questionBlock.length : 'N/A'}`);
            
            if (template.questionBlock) {
              template.questionBlock.forEach((question, qIndex) => {
                console.log(`       Q${qIndex + 1}: ${question.questionNumber} - ${question.question ? question.question.substring(0, 50) + '...' : 'No question text'}`);
              });
            }
          });
          
        } catch (err) {
          console.log(`❌ ${file}: Error reading/parsing - ${err.message}`);
        }
      } else {
        console.log(`❌ ${file}: Not found`);
      }
    }

    console.log('\n🔍 Key Questions from Database:');
    console.log('================================');
    const keyQuestions = [11, 12, 17, 18, 19, 20];
    keyQuestions.forEach(qNum => {
      const answer = listeningAnswers[qNum.toString()];
      if (answer) {
        console.log(`Q${qNum}: ${answer}`);
      }
    });

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    mongoose.connection.close();
  }
};

checkTest3Structure(); 
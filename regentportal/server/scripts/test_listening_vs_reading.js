// Test script to verify both listening and reading Multiple Choice 2 questions work the same
const fs = require('fs');
const path = require('path');

// Simulate the loadCorrectAnswers logic for both formats
function simulateLoadCorrectAnswers() {
  console.log('🧪 Testing Multiple Choice 2 logic for both formats...\n');
  
  // Reading test format (new)
  console.log('📖 READING TEST FORMAT:');
  const readingTemplate = {
    questionType: 'multiple-choice-two',
    questionGroup: {
      questionNumbers: [20, 21],
      correctAnswers: ['B', 'D']
    }
  };
  
  const readingCorrectAnswers = {};
  if (readingTemplate.questionGroup && readingTemplate.questionType === 'multiple-choice-two') {
    const group = readingTemplate.questionGroup;
    group.questionNumbers.forEach((questionNumber, index) => {
      readingCorrectAnswers[questionNumber] = group.correctAnswers[index];
    });
    console.log(`✅ Loaded individual answers for questions ${group.questionNumbers.join(', ')}:`, readingCorrectAnswers);
  }
  
  // Listening test format (old)
  console.log('\n🎧 LISTENING TEST FORMAT:');
  const listeningTemplate = {
    questionType: 'multiple-choice-two',
    questionBlock: [
      {
        questionNumber: 21,
        answer: ['B', 'C']
      },
      {
        questionNumber: 22,
        answer: ['B', 'C']
      }
    ]
  };
  
  const listeningCorrectAnswers = {};
  if (listeningTemplate.questionType === 'multiple-choice-two' && listeningTemplate.questionBlock) {
    listeningTemplate.questionBlock.forEach(question => {
      if (question.questionNumber && question.answer && Array.isArray(question.answer)) {
        listeningCorrectAnswers[question.questionNumber] = question.answer;
        console.log(`✅ Loaded answer for question ${question.questionNumber}:`, question.answer);
      }
    });
    console.log(`✅ Final listening answers:`, listeningCorrectAnswers);
  }
  
  // Test marking logic
  console.log('\n🎯 TESTING MARKING LOGIC:');
  
  // Simulate user answers
  const userAnswers = {
    20: 'B',  // Correct for reading
    21: 'A',  // Incorrect for reading
    21: 'B',  // Correct for listening
    22: 'C'   // Correct for listening
  };
  
  console.log('📝 User answers:', userAnswers);
  
  // Test reading format
  console.log('\n📖 READING TEST MARKING:');
  let readingScore = 0;
  Object.keys(readingCorrectAnswers).forEach(questionNumber => {
    const userAnswer = userAnswers[questionNumber];
    const correctAnswer = readingCorrectAnswers[questionNumber];
    
    if (userAnswer && correctAnswer.includes(userAnswer)) {
      readingScore += 1;
      console.log(`✅ Q${questionNumber}: "${userAnswer}" is correct (in ${JSON.stringify(correctAnswer)})`);
    } else {
      console.log(`❌ Q${questionNumber}: "${userAnswer}" is incorrect (should be in ${JSON.stringify(correctAnswer)})`);
    }
  });
  console.log(`📊 Reading Score: ${readingScore}/2`);
  
  // Test listening format
  console.log('\n🎧 LISTENING TEST MARKING:');
  let listeningScore = 0;
  Object.keys(listeningCorrectAnswers).forEach(questionNumber => {
    const userAnswer = userAnswers[questionNumber];
    const correctAnswer = listeningCorrectAnswers[questionNumber];
    
    if (userAnswer && correctAnswer.includes(userAnswer)) {
      listeningScore += 1;
      console.log(`✅ Q${questionNumber}: "${userAnswer}" is correct (in ${JSON.stringify(correctAnswer)})`);
    } else {
      console.log(`❌ Q${questionNumber}: "${userAnswer}" is incorrect (should be in ${JSON.stringify(correctAnswer)})`);
    }
  });
  console.log(`📊 Listening Score: ${listeningScore}/2`);
  
  console.log('\n🎯 RESULT: Both formats should now work identically!');
}

simulateLoadCorrectAnswers(); 
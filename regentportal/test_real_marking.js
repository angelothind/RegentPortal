// Test that shows the EXACT issue with Multiple Choice 2 marking
// This simulates the real logic from submitTest.js

console.log('🧪 Testing Real Multiple Choice 2 Marking Logic\n');

// Simulate the EXACT logic from submitTest.js
function simulateRealMarking(userAnswers, correctAnswers) {
  console.log('📝 Simulating submitTest.js logic:\n');
  
  // This is exactly how totalQuestions is calculated in the real code
  const allQuestions = Object.keys(correctAnswers);
  const totalQuestions = allQuestions.length;
  
  console.log(`📊 Question Analysis:`);
  console.log(`   All Questions: ${JSON.stringify(allQuestions)}`);
  console.log(`   Total Questions: ${totalQuestions}`);
  console.log(`   User Answers: ${JSON.stringify(userAnswers)}`);
  console.log(`   Correct Answers: ${JSON.stringify(correctAnswers)}\n`);
  
  let correctCount = 0;
  const results = {};
  
  // Grade each question individually (exactly like submitTest.js)
  for (const questionNumber of allQuestions) {
    const userAnswer = userAnswers[questionNumber];
    const correctAnswer = correctAnswers[questionNumber];
    let isCorrect = false;
    
    console.log(`📝 Grading question ${questionNumber}:`);
    console.log(`   User Answer: ${JSON.stringify(userAnswer)}`);
    console.log(`   Correct Answer: ${JSON.stringify(correctAnswer)}`);
    
    // Handle different answer types
    if (Array.isArray(correctAnswer)) {
      // Multiple choice with multiple answers (including MultipleChoiceTwo)
      if (Array.isArray(userAnswer) && userAnswer.length > 0) {
        // Count how many correct answers the user selected
        const correctSelections = userAnswer.filter(answer => correctAnswer.includes(answer)).length;
        const totalCorrect = correctAnswer.length;
        
        console.log(`   Correct Selections: ${correctSelections}/${totalCorrect}`);
        
        // Award marks based on correct selections
        if (correctSelections === totalCorrect) {
          // All correct answers selected - award full marks
          isCorrect = true;
          correctCount += totalCorrect; // Award marks for each correct answer
          console.log(`   ✅ ALL CORRECT! Awarding ${totalCorrect} marks. Total: ${correctCount}`);
        } else if (correctSelections > 0) {
          // Partial correct answers - award partial marks
          isCorrect = false; // Not fully correct
          correctCount += correctSelections; // Award marks for correct selections
          console.log(`   ⚠️ PARTIAL! Awarding ${correctSelections}/${totalCorrect} marks. Total: ${correctCount}`);
        } else {
          // No correct answers
          isCorrect = false;
          console.log(`   ❌ INCORRECT! No marks awarded. Total: ${correctCount}`);
        }
      } else {
        isCorrect = false;
        console.log(`   ❌ No valid user answer`);
      }
    } else {
      // Single answer questions
      const normalizedUserAnswer = userAnswer ? userAnswer.toString().trim().toUpperCase() : '';
      const normalizedCorrectAnswer = correctAnswer ? correctAnswer.toString().trim().toUpperCase() : '';
      
      const hasValidAnswer = normalizedUserAnswer && normalizedUserAnswer.trim() !== '';
      isCorrect = hasValidAnswer && normalizedUserAnswer === normalizedCorrectAnswer;
      
      if (isCorrect) {
        correctCount += 1;
        console.log(`   ✅ Correct: +1 mark. Total: ${correctCount}`);
      } else {
        console.log(`   ❌ Incorrect: +0 marks. Total: ${correctCount}`);
      }
    }
    
    results[questionNumber] = {
      userAnswer: userAnswer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect
    };
    
    console.log(`   Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
    console.log('');
  }
  
  // This is exactly how the score is calculated in the real code
  const score = Math.round((correctCount / totalQuestions) * 100);
  
  console.log(`📊 Final Results:`);
  console.log(`   Total Questions: ${totalQuestions}`);
  console.log(`   Total Marks: ${correctCount}`);
  console.log(`   Score: ${score}%`);
  
  return { totalQuestions, correctCount, score, results };
}

// Test with a realistic Multiple Choice 2 scenario
console.log('🔍 Testing Realistic Multiple Choice 2 Scenario:\n');

// Simulate a test with Multiple Choice 2 questions
const testScenario = {
  userAnswers: {
    "1": "TRUE",           // Single answer: TFNG
    "2": "FALSE",          // Single answer: TFNG  
    "3": "NOT GIVEN",      // Single answer: TFNG
    "4": "paint",          // Single answer: Choose X Words
    "5": "topspin",        // Single answer: Choose X Words
    "6": "training",       // Single answer: Choose X Words
    "7": ["B", "A"],       // Multiple Choice 2: Partial (1 correct, 1 wrong)
    "8": ["C", "E"],       // Multiple Choice 2: Perfect (2 correct)
    "9": "grain",          // Single answer: Choose X Words
    "10": "punishment"     // Single answer: Choose X Words
  },
  
  correctAnswers: {
    "1": "TRUE",           // Single answer
    "2": "FALSE",          // Single answer
    "3": "NOT GIVEN",      // Single answer
    "4": "paint",          // Single answer
    "5": "topspin",        // Single answer
    "6": "training",       // Single answer
    "7": ["B", "D"],       // Multiple Choice 2: Should award 1 mark for partial
    "8": ["C", "E"],       // Multiple Choice 2: Should award 2 marks for perfect
    "9": "grain",          // Single answer
    "10": "punishment"     // Single answer
  }
};

const result = simulateRealMarking(testScenario.userAnswers, testScenario.correctAnswers);

console.log('\n🔍 Analysis of the Issue:');
console.log(`   Questions with Multiple Choice 2: 7, 8`);
console.log(`   Question 7: Partial answer ["B", "A"] vs ["B", "D"] → +1 mark`);
console.log(`   Question 8: Perfect answer ["C", "E"] vs ["C", "E"] → +2 marks`);
console.log(`   Total marks from Multiple Choice 2: 3 marks`);
console.log(`   But totalQuestions counts them as: 2 questions`);

console.log('\n💡 The Problem:');
console.log('   - Multiple Choice 2 questions can award 2 marks each');
console.log('   - But totalQuestions counts each question as 1');
console.log('   - This creates a scoring mismatch');

console.log('\n📊 Expected vs Actual:');
console.log('   Expected: 10 questions, 10 marks = 100%');
console.log('   Actual: 10 questions, 11 marks = 110% (impossible!)');

console.log('\n🔧 The Real Issue:');
console.log('   The code DOES award partial marks (1 mark for partial answers)');
console.log('   But the score calculation is flawed because:');
console.log('   - Multiple Choice 2 questions can award 2 marks');
console.log('   - But they\'re counted as 1 question each');
console.log('   - This leads to scores >100% and incorrect percentages'); 
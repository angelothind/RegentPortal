// Debug script to show exactly what happens with Multiple Choice 2 marking
// This reveals the actual issue in the logic

console.log('🔍 Debugging Multiple Choice 2 Marking Logic\n');

// Simulate the EXACT logic from submitTest.js
function debugMarkingLogic(userAnswer, correctAnswer, questionNumber) {
  console.log(`📝 Debugging Question ${questionNumber}:`);
  console.log(`   User Answer: ${JSON.stringify(userAnswer)}`);
  console.log(`   Correct Answer: ${JSON.stringify(correctAnswer)}`);
  
  let isCorrect = false;
  let marksAwarded = 0;
  let correctCount = 0; // This is the key variable
  
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
        marksAwarded = totalCorrect;
        console.log(`   ✅ ALL CORRECT! Awarding ${totalCorrect} marks. Total: ${correctCount}`);
      } else if (correctSelections > 0) {
        // Partial correct answers - award partial marks
        isCorrect = false; // Not fully correct
        correctCount += correctSelections; // Award marks for correct selections
        marksAwarded = correctSelections;
        console.log(`   ⚠️ PARTIAL! Awarding ${correctSelections}/${totalCorrect} marks. Total: ${correctCount}`);
      } else {
        // No correct answers
        isCorrect = false;
        marksAwarded = 0;
        console.log(`   ❌ INCORRECT! No marks awarded. Total: ${correctCount}`);
      }
      
      console.log(`   Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}, Marks: ${marksAwarded}, Total Count: ${correctCount}`);
    } else {
      isCorrect = false;
      marksAwarded = 0;
      console.log(`   ❌ No valid user answer`);
    }
  }
  
  console.log('');
  return { isCorrect, marksAwarded, correctCount };
}

// Test the specific case you mentioned
console.log('🧪 Testing the specific case:\n');

const testCase = {
  userAnswer: ["B", "A"],  // Student selects B (correct) and A (wrong)
  correctAnswer: ["B", "D"], // Correct answers are B and D
  questionNumber: "20-21"
};

const result = debugMarkingLogic(
  testCase.userAnswer, 
  testCase.correctAnswer, 
  testCase.questionNumber
);

console.log('📊 Final Result:');
console.log(`   Question Status: ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
console.log(`   Marks Awarded: ${result.marksAwarded}`);
console.log(`   Total Count: ${result.correctCount}`);

// Now let's test what happens in the final score calculation
console.log('\n🧮 Testing Final Score Calculation:');

// Simulate a test with 4 questions
const testQuestions = [
  { userAnswer: ["B", "A"], correctAnswer: ["B", "D"] },      // Partial: should get 1 mark
  { userAnswer: ["A", "C"], correctAnswer: ["B", "D"] },      // Wrong: should get 0 marks
  { userAnswer: "grain", correctAnswer: "grain" },            // Single: should get 1 mark
  { userAnswer: "wrong", correctAnswer: "correct" }            // Wrong: should get 0 marks
];

let totalCorrectCount = 0;
let totalQuestions = testQuestions.length;

testQuestions.forEach((q, index) => {
  console.log(`\n🔍 Question ${index + 1}:`);
  
  if (Array.isArray(q.correctAnswer)) {
    // Multiple choice question
    const correctSelections = q.userAnswer.filter(answer => q.correctAnswer.includes(answer)).length;
    const totalCorrect = q.correctAnswer.length;
    
    if (correctSelections === totalCorrect) {
      totalCorrectCount += totalCorrect;
      console.log(`   ✅ Perfect: +${totalCorrect} marks (Total: ${totalCorrectCount})`);
    } else if (correctSelections > 0) {
      totalCorrectCount += correctSelections;
      console.log(`   ⚠️ Partial: +${correctSelections} marks (Total: ${totalCorrectCount})`);
    } else {
      console.log(`   ❌ Wrong: +0 marks (Total: ${totalCorrectCount})`);
    }
  } else {
    // Single answer question
    if (q.userAnswer === q.correctAnswer) {
      totalCorrectCount += 1;
      console.log(`   ✅ Correct: +1 mark (Total: ${totalCorrectCount})`);
    } else {
      console.log(`   ❌ Wrong: +0 marks (Total: ${totalCorrectCount})`);
    }
  }
});

const finalScore = Math.round((totalCorrectCount / totalQuestions) * 100);

console.log(`\n📝 Final Test Results:`);
console.log(`   Total Questions: ${totalQuestions}`);
console.log(`   Total Marks: ${totalCorrectCount}`);
console.log(`   Score: ${finalScore}%`);

// Now let's check what the actual issue might be
console.log('\n🔍 Potential Issues Found:');

console.log('1. The code DOES award partial marks for Multiple Choice 2 questions');
console.log('2. However, the final score calculation uses totalQuestions as denominator');
console.log('3. This means if you have 4 questions but get 5 total marks, you could get >100%');

console.log('\n💡 The Issue:');
console.log('   - Multiple Choice 2 questions can award 2 marks');
console.log('   - But totalQuestions counts each question as 1');
console.log('   - This creates a mismatch between marks and question count');

console.log('\n🔧 Possible Solutions:');
console.log('1. Count Multiple Choice 2 questions as 2 questions instead of 1');
console.log('2. Normalize the score calculation to account for multi-mark questions');
console.log('3. Use a different scoring method for these question types'); 
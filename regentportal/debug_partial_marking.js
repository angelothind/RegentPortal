// Debug script to show why partial answers get 2 marks instead of 1
// This reveals the exact logic issue

console.log('🔍 Debugging Why Partial Answers Get 2 Marks Instead of 1\n');

// Let's trace through the EXACT logic step by step
function debugPartialMarking(userAnswer, correctAnswer, questionNumber) {
  console.log(`📝 Debugging Question ${questionNumber}:`);
  console.log(`   User Answer: ${JSON.stringify(userAnswer)}`);
  console.log(`   Correct Answer: ${JSON.stringify(correctAnswer)}`);
  console.log('');
  
  // Step 1: Check if correctAnswer is an array
  const isArrayAnswer = Array.isArray(correctAnswer);
  console.log(`🔍 Step 1: Is correctAnswer an array? ${isArrayAnswer}`);
  
  if (isArrayAnswer) {
    // Step 2: Check if userAnswer is an array and has length > 0
    const isUserAnswerArray = Array.isArray(userAnswer);
    const hasUserAnswerLength = userAnswer && userAnswer.length > 0;
    console.log(`🔍 Step 2: Is userAnswer an array? ${isUserAnswerArray}`);
    console.log(`🔍 Step 2: Does userAnswer have length > 0? ${hasUserAnswerLength}`);
    
    if (isUserAnswerArray && hasUserAnswerLength) {
      // Step 3: Count correct selections
      const correctSelections = userAnswer.filter(answer => correctAnswer.includes(answer)).length;
      const totalCorrect = correctAnswer.length;
      console.log(`🔍 Step 3: Correct selections: ${correctSelections}/${totalCorrect}`);
      
      // Step 4: Determine which branch to take
      if (correctSelections === totalCorrect) {
        console.log(`🔍 Step 4: Branch: correctSelections (${correctSelections}) === totalCorrect (${totalCorrect})`);
        console.log(`   → Taking "ALL CORRECT" branch`);
        console.log(`   → Setting isCorrect = true`);
        console.log(`   → Adding ${totalCorrect} to correctCount`);
        console.log(`   → This should award ${totalCorrect} marks`);
      } else if (correctSelections > 0) {
        console.log(`🔍 Step 4: Branch: correctSelections (${correctSelections}) > 0`);
        console.log(`   → Taking "PARTIAL" branch`);
        console.log(`   → Setting isCorrect = false`);
        console.log(`   → Adding ${correctSelections} to correctCount`);
        console.log(`   → This should award ${correctSelections} marks`);
      } else {
        console.log(`🔍 Step 4: Branch: correctSelections (${correctSelections}) === 0`);
        console.log(`   → Taking "NO CORRECT" branch`);
        console.log(`   → Setting isCorrect = false`);
        console.log(`   → Adding 0 to correctCount`);
        console.log(`   → This should award 0 marks`);
      }
      
      // Step 5: Show the actual logic execution
      console.log(`\n🔍 Step 5: Executing the logic:`);
      
      let isCorrect = false;
      let marksAwarded = 0;
      
      if (correctSelections === totalCorrect) {
        isCorrect = true;
        marksAwarded = totalCorrect;
        console.log(`   ✅ ALL CORRECT! Awarding ${totalCorrect} marks`);
      } else if (correctSelections > 0) {
        isCorrect = false;
        marksAwarded = correctSelections;
        console.log(`   ⚠️ PARTIAL! Awarding ${correctSelections} marks`);
      } else {
        isCorrect = false;
        marksAwarded = 0;
        console.log(`   ❌ INCORRECT! Awarding 0 marks`);
      }
      
      console.log(`   Final Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}, Marks: ${marksAwarded}`);
      
      return { isCorrect, marksAwarded, correctSelections, totalCorrect };
    } else {
      console.log(`🔍 Step 2: User answer conditions not met`);
      console.log(`   → Taking "no valid user answer" branch`);
      console.log(`   → Setting isCorrect = false`);
      console.log(`   → Awarding 0 marks`);
      return { isCorrect: false, marksAwarded: 0, correctSelections: 0, totalCorrect: 0 };
    }
  } else {
    console.log(`🔍 Step 1: correctAnswer is not an array`);
    console.log(`   → Taking single answer question branch`);
    return null;
  }
}

// Test the specific case you mentioned
console.log('🧪 Testing Your Specific Case:\n');

const testCase = {
  userAnswer: ["B", "A"],      // Student selects B (correct) and A (wrong)
  correctAnswer: ["B", "D"],   // Correct answers are B and D
  questionNumber: "20-21"
};

console.log('📋 Test Case:');
console.log(`   User selects: ${JSON.stringify(testCase.userAnswer)}`);
console.log(`   Correct answers: ${JSON.stringify(testCase.correctAnswer)}`);
console.log(`   Expected: Should get 1 mark (for B being correct)`);
console.log(`   Issue: You\'re getting 2 marks instead of 1`);
console.log('');

const result = debugPartialMarking(
  testCase.userAnswer, 
  testCase.correctAnswer, 
  testCase.questionNumber
);

console.log('\n🔍 Analysis of the Issue:');
console.log(`   Your answer: ${JSON.stringify(testCase.userAnswer)}`);
console.log(`   Correct answers: ${JSON.stringify(testCase.correctAnswer)}`);
console.log(`   Correct selections: ${result.correctSelections}`);
console.log(`   Total correct needed: ${result.totalCorrect}`);
console.log(`   Marks awarded: ${result.marksAwarded}`);

console.log('\n💡 The Problem:');
console.log('   Looking at the logic, it SHOULD award 1 mark for partial answers.');
console.log('   But you\'re saying you\'re getting 2 marks.');
console.log('   This suggests there might be a bug in the actual execution.');

console.log('\n🔍 Possible Causes:');
console.log('1. The logic is not being executed as written');
console.log('2. There\'s a bug in the filter logic');
console.log('3. The correctAnswer array is not what we expect');
console.log('4. The userAnswer array is being modified somewhere');

console.log('\n🧪 Let\'s verify the filter logic:');
const userAnswer = ["B", "A"];
const correctAnswer = ["B", "D"];
const correctSelections = userAnswer.filter(answer => correctAnswer.includes(answer)).length;

console.log(`   userAnswer.filter(answer => correctAnswer.includes(answer)):`);
console.log(`   → "B" in ["B", "D"]? ${correctAnswer.includes("B")}`);
console.log(`   → "A" in ["B", "D"]? ${correctAnswer.includes("A")}`);
console.log(`   → Total correct selections: ${correctSelections}`);
console.log(`   → This should award ${correctSelections} marks, not 2!`);

console.log('\n❓ The Mystery:');
console.log('   According to the code, you should get 1 mark.');
console.log('   But you\'re getting 2 marks.');
console.log('   This suggests the code is not working as intended.');
console.log('   We need to check if there are multiple questions being processed');
console.log('   or if there\'s a bug in the actual execution.'); 
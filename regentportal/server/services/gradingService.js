const Test = require('../models/Test');

// Function to load correct answers from database based on test type
const loadCorrectAnswers = async (testId, testType) => {
  try {
    const test = await Test.findById(testId);
    console.log('📝 Found test:', test ? test.title : 'NOT FOUND');
    console.log('📝 Test ID being searched:', testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // First, try to load answers from database (prioritize these)
    console.log(`📝 Loading correct answers from database for ${testType}...`);

    if (test.answers && test.answers.size > 0) {
      console.log('✅ Found answers in database');

      // Get answers for the specific test type
      const testTypeAnswers = test.answers.get(testType.toLowerCase());

      if (testTypeAnswers) {
        if (Array.isArray(testTypeAnswers)) {
          // Array format - convert to object with array indices as keys (matching Book 19 format)
          console.log(`📝 Found ${testTypeAnswers.length} ${testType} answers in database (array format)`);
          console.log(`📝 First few answers:`, testTypeAnswers.slice(0, 5));

          const dbAnswers = {};
          testTypeAnswers.forEach((answer, index) => {
            const questionNumber = (index + 1).toString();
            dbAnswers[questionNumber] = answer;
            console.log(`📝 Mapping index ${index} → question ${questionNumber}: ${answer}`);
          });

          console.log(`✅ Converted ${Object.keys(dbAnswers).length} answers from array format`);
          console.log(`📝 Sample mapped answers:`, {
            '1': dbAnswers['1'],
            '15': dbAnswers['15'],
            '16': dbAnswers['16'],
            '17': dbAnswers['17'],
            '18': dbAnswers['18'],
            '28': dbAnswers['28'],
            '31': dbAnswers['31']
          });
          return dbAnswers;
        } else if (typeof testTypeAnswers === 'object') {
          // Object format - already has array indices as keys (Book 19 format)
          console.log(`📝 Found ${Object.keys(testTypeAnswers).length} ${testType} answers in database (object format)`);
          return testTypeAnswers;
        }
      }
    }

    // No database answers found - throw error instead of falling back to JSON
    console.log(`❌ No database answers found for ${testType} test`);
    throw new Error(`No database answers found for ${testType} test. Database must contain all correct answers.`);
  } catch (error) {
    console.error('❌ Error loading correct answers:', error);
    throw error;
  }
};

// Map table-completion keys (e.g. "8-9_0", "10-12_2") to individual question numbers
const normalizeTableCompletionAnswers = (answers) => {
  const normalized = { ...answers };

  Object.entries(answers).forEach(([key, value]) => {
    const rangeMatch = key.match(/^(\d+-\d+)_(\d+)$/);
    if (!rangeMatch) return;

    const [, range, indexStr] = rangeMatch;
    const [startNum] = range.split('-').map(Number);
    const questionNumber = String(startNum + parseInt(indexStr, 10));
    normalized[questionNumber] = value;
  });

  return normalized;
};

// Grade every question in correctAnswers against the (already normalized) submitted answers.
const gradeAnswers = (correctAnswers, normalizedAnswers) => {
  let correctCount = 0;
  const allQuestions = Object.keys(correctAnswers);
  const totalQuestions = allQuestions.length;
  const results = {};

  console.log('📝 Grading ALL questions individually:', allQuestions);
  console.log('📝 User answers:', normalizedAnswers);

  for (const questionNumber of allQuestions) {
    const userAnswer = normalizedAnswers[questionNumber];
    const correctAnswer = correctAnswers[questionNumber];
    let isCorrect = false;

    // Handle different answer types
    if (Array.isArray(correctAnswer)) {
      console.log(`🔍 Multiple Choice 2 Question ${questionNumber}:`, {
        userAnswer,
        correctAnswer,
        userAnswerIsArray: Array.isArray(userAnswer),
        userAnswerType: typeof userAnswer
      });

      // Multiple choice with multiple answers (including MultipleChoiceTwo)
      if (Array.isArray(userAnswer) && userAnswer.length > 0) {
        // Count how many correct answers the user selected
        const correctSelections = userAnswer.filter(answer => correctAnswer.includes(answer)).length;
        const totalCorrect = correctAnswer.length;

        // Award marks based on correct selections
        if (correctSelections === totalCorrect) {
          // All correct answers selected - award full marks
          isCorrect = true;
          correctCount += totalCorrect; // Award marks for each correct answer
          console.log(`📝 Multiple choice question ${questionNumber}: ALL CORRECT! Awarding ${totalCorrect} marks. Total: ${correctCount}`);
        } else if (correctSelections > 0) {
          // Partial correct answers - award partial marks
          isCorrect = false; // Not fully correct
          correctCount += correctSelections; // Award marks for correct selections
          console.log(`📝 Multiple choice question ${questionNumber}: PARTIAL! Awarding ${correctSelections}/${totalCorrect} marks. Total: ${correctCount}`);
        } else {
          // No correct answers
          isCorrect = false;
          console.log(`📝 Multiple choice question ${questionNumber}: INCORRECT! No marks awarded. Total: ${correctCount}`);
        }

        console.log(`📝 Multiple choice question ${questionNumber} result:`, {
          userAnswer,
          correctAnswer,
          userAnswerLength: userAnswer.length,
          correctAnswerLength: correctAnswer.length,
          correctSelections,
          totalCorrect,
          isCorrect: isCorrect || correctSelections > 0 // Consider partially correct as "correct" for display
        });
      } else if (userAnswer && !Array.isArray(userAnswer)) {
        console.log(`🔍 Multiple Choice 2 Question ${questionNumber} - Single answer against array:`, {
          userAnswer,
          correctAnswer,
          userAnswerType: typeof userAnswer
        });

        // Single student answer against array correct answer (Multiple Choice 2)
        // Check if the single answer matches any of the correct options
        const normalizedUserAnswer = userAnswer.toString().trim();
        const isAnswerCorrect = correctAnswer.some(correctOption =>
          correctOption.toString().trim().toLowerCase() === normalizedUserAnswer.toLowerCase()
        );

        if (isAnswerCorrect) {
          isCorrect = true;
          correctCount += 1; // Award 1 mark for correct answer
          console.log(`📝 Multiple Choice 2 question ${questionNumber}: CORRECT! Student "${normalizedUserAnswer}" matches one of ${JSON.stringify(correctAnswer)}. Awarding 1 mark. Total: ${correctCount}`);
        } else {
          isCorrect = false;
          console.log(`📝 Multiple Choice 2 question ${questionNumber}: INCORRECT! Student "${normalizedUserAnswer}" does not match any of ${JSON.stringify(correctAnswer)}. No marks awarded. Total: ${correctCount}`);
        }

        console.log(`📝 Multiple Choice 2 question ${questionNumber} result:`, {
          userAnswer: normalizedUserAnswer,
          correctAnswer,
          isCorrect
        });
      } else {
        isCorrect = false;
        console.log(`📝 Multiple choice question ${questionNumber}: no valid user answer`);
      }
    } else {
      // Single answer questions (including Multiple Choice 2 individual questions)
      const normalizedUserAnswer = userAnswer ? userAnswer.toString().trim() : '';
      const normalizedCorrectAnswer = correctAnswer ? correctAnswer.toString().trim() : '';

      // Debug empty answers
      console.log(`🔍 Question ${questionNumber} answer analysis:`, {
        originalUserAnswer: userAnswer,
        normalizedUserAnswer,
        isEmpty: normalizedUserAnswer === '',
        correctAnswer: normalizedCorrectAnswer,
        willBeMarkedCorrect: normalizedUserAnswer !== '' && normalizedUserAnswer === normalizedCorrectAnswer
      });

      // Ensure empty/falsy answers are marked as incorrect
      const hasValidAnswer = normalizedUserAnswer && normalizedUserAnswer.trim() !== '';
      isCorrect = hasValidAnswer && normalizedUserAnswer === normalizedCorrectAnswer;

      if (isCorrect) {
        correctCount += 1; // Award 1 mark for correct answer
        console.log(`📝 Single answer question ${questionNumber}: CORRECT! Awarding 1 mark. Total: ${correctCount}`);
      } else {
        console.log(`📝 Single answer question ${questionNumber}: INCORRECT! No marks awarded. Total: ${correctCount}`);
      }

      console.log(`📝 Single answer question ${questionNumber} result:`, {
        userAnswer: normalizedUserAnswer,
        correctAnswer: normalizedCorrectAnswer,
        hasValidAnswer,
        isCorrect
      });
    }

    results[questionNumber] = {
      userAnswer: userAnswer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect
    };

    console.log(`📝 Results for Q${questionNumber}:`, {
      userAnswer,
      correctAnswer,
      isCorrect,
      correctAnswerType: typeof correctAnswer,
      userAnswerType: typeof userAnswer
    });
  }

  const score = Math.round((correctCount / totalQuestions) * 100);

  return { results, correctCount, totalQuestions, score };
};

module.exports = { loadCorrectAnswers, normalizeTableCompletionAnswers, gradeAnswers };

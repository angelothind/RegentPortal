const Test = require('../models/Test');

// Function to load correct answers from database based on test type
const loadCorrectAnswers = async (testId, testType) => {
  try {
    const test = await Test.findById(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    if (test.answers && test.answers.size > 0) {
      const testTypeAnswers = test.answers.get(testType.toLowerCase());

      if (testTypeAnswers) {
        if (Array.isArray(testTypeAnswers)) {
          const dbAnswers = {};
          testTypeAnswers.forEach((answer, index) => {
            const questionNumber = (index + 1).toString();
            dbAnswers[questionNumber] = answer;
          });
          return dbAnswers;
        } else if (typeof testTypeAnswers === 'object') {
          return testTypeAnswers;
        }
      }
    }

    throw new Error(`No database answers found for ${testType} test. Database must contain all correct answers.`);
  } catch (error) {
    console.error('Error loading correct answers:', error);
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

  for (const questionNumber of allQuestions) {
    const userAnswer = normalizedAnswers[questionNumber];
    const correctAnswer = correctAnswers[questionNumber];
    let isCorrect = false;

    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(userAnswer) && userAnswer.length > 0) {
        const correctSelections = userAnswer.filter(answer => correctAnswer.includes(answer)).length;
        const totalCorrect = correctAnswer.length;

        if (correctSelections === totalCorrect) {
          isCorrect = true;
          correctCount += totalCorrect;
        } else if (correctSelections > 0) {
          isCorrect = false;
          correctCount += correctSelections;
        } else {
          isCorrect = false;
        }
      } else if (userAnswer && !Array.isArray(userAnswer)) {
        const normalizedUserAnswer = userAnswer.toString().trim();
        const isAnswerCorrect = correctAnswer.some(correctOption =>
          correctOption.toString().trim().toLowerCase() === normalizedUserAnswer.toLowerCase()
        );

        if (isAnswerCorrect) {
          isCorrect = true;
          correctCount += 1;
        } else {
          isCorrect = false;
        }
      } else {
        isCorrect = false;
      }
    } else {
      const normalizedUserAnswer = userAnswer ? userAnswer.toString().trim() : '';
      const normalizedCorrectAnswer = correctAnswer ? correctAnswer.toString().trim() : '';

      const hasValidAnswer = normalizedUserAnswer && normalizedUserAnswer.trim() !== '';
      isCorrect = hasValidAnswer && normalizedUserAnswer === normalizedCorrectAnswer;

      if (isCorrect) {
        correctCount += 1;
      }
    }

    results[questionNumber] = {
      userAnswer: userAnswer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect
    };
  }

  const score = Math.round((correctCount / totalQuestions) * 100);

  return { results, correctCount, totalQuestions, score };
};

module.exports = { loadCorrectAnswers, normalizeTableCompletionAnswers, gradeAnswers };

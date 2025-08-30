import React, { useState } from 'react';
import '../../styles/Questions/MultipleChoiceTwo.css';
import { processTextFormatting } from '../../utils/textFormatting';

const MultipleChoiceTwo = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'multiple-choice-two', currentAnswers = {}, testType }) => {
  console.log('🎯 MultipleChoiceTwo rendered with template:', template);
  console.log('🎯 MultipleChoiceTwo testResults:', testResults);
  console.log('🎯 MultipleChoiceTwo testSubmitted:', testSubmitted);
  console.log('🎯 MultipleChoiceTwo currentAnswers:', currentAnswers);

  // Handle both old and new JSON formats
  const getQuestionData = () => {
    console.log('🔍 MultipleChoiceTwo getQuestionData called with template:', template);
    
    if (template.questionGroup) {
      // New format
      console.log('✅ Using new questionGroup format');
      return {
        questionNumbers: template.questionGroup.questionNumbers,
        options: template.questionGroup.options,
        correctAnswers: template.questionGroup.correctAnswers, // This is just for display, not for marking
        maxSelections: template.questionGroup.maxSelections || 2
      };
    } else if (template.questionBlock) {
      // Old format - convert to new format
      console.log('✅ Using old questionBlock format, converting...');
      const firstQuestion = template.questionBlock[0];
      console.log('🔍 First question:', firstQuestion);
      
      if (firstQuestion && firstQuestion.options) {
        console.log('✅ Converting questionBlock to questionGroup format');
        const result = {
          questionNumbers: template.questionBlock.map(q => q.questionNumber),
          options: firstQuestion.options,
          correctAnswers: [], // Don't use JSON answers for marking
          maxSelections: 2
        };
        console.log('✅ Converted result:', result);
        return result;
      } else {
        console.log('❌ Invalid questionBlock format');
        return null;
      }
    } else {
      console.log('❌ No valid question format found');
      return null;
    }
  };

  const questionData = getQuestionData();

  if (!questionData) {
    console.log('❌ MultipleChoiceTwo: No valid question data found');
    console.log('❌ Template received:', template);
    return <div>No questions available</div>;
  }

  console.log('🎯 MultipleChoiceTwo: Question data:', questionData);
  console.log('🎯 MultipleChoiceTwo: Correct answers from template:', questionData.correctAnswers);
  console.log('🎯 MultipleChoiceTwo: Question numbers from template:', questionData.questionNumbers);

  const questionGroup = questionData;
  const { questionNumbers, maxSelections } = questionGroup;
  
  console.log('🎯 MultipleChoiceTwo: Extracted questionNumbers:', questionNumbers);
  console.log('🎯 MultipleChoiceTwo: Extracted maxSelections:', maxSelections);

  const getOptionClass = (option) => {
    if (!testSubmitted || !testResults) return '';
    
    // Check if this option is selected in any of the questions
    const isSelectedInAnyQuestion = questionNumbers.some(questionNumber => {
      const answer = getAnswerValue(questionNumber);
      return answer === option.letter;
    });
    
    if (isSelectedInAnyQuestion) {
      // If selected, determine if it's correct or incorrect
      const isCorrect = questionGroup.correctAnswers.includes(option.letter);
      console.log(`🔍 Option ${option.letter}: selected=${isSelectedInAnyQuestion}, correct=${isCorrect}, correctAnswers=${JSON.stringify(questionGroup.correctAnswers)}`);
      if (isCorrect) {
      return 'option-correct';
      } else {
      return 'option-incorrect';
      }
    }
    
    return '';
  };

  const isQuestionUnanswered = (questionNumber) => {
    if (!testSubmitted || !testResults) return false;
    
    // Handle both old and new result structures
    let userAnswer;
    if (testResults.answers && testResults.answers[questionNumber]) {
      // New structure
      userAnswer = testResults.answers[questionNumber];
    } else if (testResults.givenAnswers) {
      // Old structure - find the answer for this question
      const testSubmission = testResults.givenAnswers.find(sub => 
        sub.testId === testResults.testId
      );
      if (testSubmission && testSubmission.answers) {
        userAnswer = testSubmission.answers[questionNumber];
      }
    }
    
    return !userAnswer || userAnswer.trim() === '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      // Handle both old and new result structures
      if (testResults.answers && testResults.answers[questionNumber]) {
        // New structure
        return testResults.answers[questionNumber] || "";
      } else if (testResults.givenAnswers) {
        // Old structure - find the answer for this question
        const testSubmission = testResults.givenAnswers.find(sub => 
          sub.testId === testResults.testId
        );
        if (testSubmission && testSubmission.answers) {
          return testSubmission.answers[questionNumber] || "";
        }
      }
      return "";
    }
    
    // Return individual question answer (now a string, not array)
    return currentAnswers[questionNumber] || "";
  };

  return (
    <div className="multiple-choice-two-container">
      <div className="instructions">
        <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.introInstruction) 
        }} />
        <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.formattingInstruction) 
        }} />
      </div>
      
      <div className="questions-section">
        {/* Show main question text for all test types */}
        {template.mainQuestion && (
          <div className="main-question">
            <p className="main-question-text" dangerouslySetInnerHTML={{ 
              __html: processTextFormatting(template.mainQuestion) 
            }} />
          </div>
        )}
        
        {/* Show the actual question text from the first question in the block */}
        {template.questionBlock && template.questionBlock[0] && template.questionBlock[0].question && (
          <div className="question-text-display">
            <p className="question-text-content" dangerouslySetInnerHTML={{ 
              __html: processTextFormatting(template.questionBlock[0].question) 
            }} />
          </div>
        )}
        
        {/* Render options only once */}
        <div className="options-container">
          {questionGroup.options.map((option) => {
            // Check if this option is selected in any of the questions
            const isSelectedInAnyQuestion = questionNumbers.some(questionNumber => {
              const answer = getAnswerValue(questionNumber);
              return answer === option.letter;
            });
            
            // Get the combined option class from all questions
            let combinedOptionClass = '';
            if (testSubmitted && testResults) {
              if (isSelectedInAnyQuestion) {
                // If selected, determine if it's correct or incorrect using BACKEND data
                let isCorrect = false;
                
                // Check if this option is correct for the specific question where it's selected
                for (const questionNumber of questionNumbers) {
                  const userAnswer = getAnswerValue(questionNumber);
                  console.log(`🔍 Checking question ${questionNumber}: userAnswer=${userAnswer}, option=${option.letter}`);
                  if (userAnswer === option.letter) {
                    // This option is selected for this question, check if it's correct
                    const correctAnswer = testResults.correctAnswers?.[questionNumber];
                    console.log(`🔍 Question ${questionNumber} has option ${option.letter} selected, correctAnswer=${JSON.stringify(correctAnswer)}`);
                    if (correctAnswer) {
                      if (Array.isArray(correctAnswer)) {
                        // Array format: check if option is in the correct answers array
                        if (correctAnswer.includes(option.letter)) {
                          isCorrect = true;
                          console.log(`🔍 Option ${option.letter} is CORRECT for question ${questionNumber} (array format)`);
                          break;
                        }
                      } else if (typeof correctAnswer === 'string' && correctAnswer.includes(',')) {
                        // String format with commas: convert to array and check
                        const correctAnswerArray = correctAnswer.split(',').map(s => s.trim());
                        if (correctAnswerArray.includes(option.letter)) {
                          isCorrect = true;
                          console.log(`🔍 Option ${option.letter} is CORRECT for question ${questionNumber} (comma-separated string format)`);
                          break;
                        }
                      } else {
                        // String format: check if option matches the correct answer
                        if (correctAnswer === option.letter) {
                          isCorrect = true;
                          console.log(`🔍 Option ${option.letter} is CORRECT for question ${questionNumber} (string format)`);
                          break;
                        }
                      }
                    }
                  }
                }
                
                console.log(`🔍 Option ${option.letter}: selected=${isSelectedInAnyQuestion}, correct=${isCorrect}, backendAnswers=${JSON.stringify(testResults.correctAnswers)}`);
                if (isCorrect) {
                  combinedOptionClass = 'option-correct';
                } else {
                  combinedOptionClass = 'option-incorrect';
                }
              }
            }
                  
                  return (
                    <label 
                      key={option.letter} 
                className={`option-label ${isSelectedInAnyQuestion ? 'selected' : ''} ${combinedOptionClass}`}
                    >
                      <input
                        type="checkbox"
                        value={option.letter}
                  checked={isSelectedInAnyQuestion}
                        className="option-checkbox"
                        disabled={testSubmitted}
                        onChange={(e) => {
                    console.log(`🔍 Option clicked:`, option.letter, 'Checked:', e.target.checked);
                    
                    // Handle selection for all questions in the group
                    const finalUpdatedAnswers = { ...currentAnswers };
                    
                    // For Multiple Choice 2: assign first choice to first question, second choice to second question
                    const questionNumbers = questionGroup.questionNumbers;
                          
                          if (e.target.checked) {
                      // Add option to the first empty question, or replace if both are filled
                      const firstEmptyIndex = questionNumbers.findIndex(qNum => !finalUpdatedAnswers[qNum]);
                      if (firstEmptyIndex !== -1) {
                        // Found an empty slot, add the option there
                        finalUpdatedAnswers[questionNumbers[firstEmptyIndex]] = option.letter;
                        console.log(`🔍 Added ${option.letter} to question ${questionNumbers[firstEmptyIndex]}`);
                      } else {
                        // Both are filled, replace the first one (FIFO)
                        finalUpdatedAnswers[questionNumbers[0]] = finalUpdatedAnswers[questionNumbers[1]];
                        finalUpdatedAnswers[questionNumbers[1]] = option.letter;
                        console.log(`🔍 Replaced first answer with second, added ${option.letter} to second question`);
                      }
                    } else {
                      // Remove option from whichever question has it
                      const questionWithOption = questionNumbers.find(qNum => finalUpdatedAnswers[qNum] === option.letter);
                      if (questionWithOption) {
                        finalUpdatedAnswers[questionWithOption] = "";
                        console.log(`🔍 Removed ${option.letter} from question ${questionWithOption}`);
                      }
                    }
                    
                    console.log(`🔍 Final answers:`, finalUpdatedAnswers);
                    
                    // Call onAnswerChange ONCE with the complete updated answers
                      if (onAnswerChange) {
                      onAnswerChange(finalUpdatedAnswers);
                      }
                        }}
                      />
                      <span className="option-letter">{option.letter}.</span>
                      <span className="option-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>
              
        {/* Show selection info for individual questions */}
              <div className="selection-info">
          Selected: {questionNumbers.filter(qNum => currentAnswers[qNum]).length} / {maxSelections}
        </div>
          
        {/* Show correct answers only after test is submitted using backend data */}
        {testSubmitted && testResults && (
                  <div className="answer-feedback">
                        <span className="correct-answer">
              Correct answers for Questions {questionNumbers.join(' & ')}: {
                // Get the correct answers from the first question (they should be the same for all questions in the group)
                (() => {
                  const firstQuestionNumber = questionNumbers[0];
                  const correctAnswer = testResults.correctAnswers?.[firstQuestionNumber];
                  if (correctAnswer) {
                    if (Array.isArray(correctAnswer)) {
                      return correctAnswer.join(', ');
                    } else if (typeof correctAnswer === 'string' && correctAnswer.includes(',')) {
                      return correctAnswer;
                    } else {
                      return String(correctAnswer);
                    }
                  }
                  return '';
                })()
              }
                        </span>
          </div>
                )}
      </div>
    </div>
  );
};

export default MultipleChoiceTwo; 
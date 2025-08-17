import React, { useState } from 'react';
import '../../styles/Questions/MultipleChoiceTwo.css';
import { processTextFormatting } from '../../utils/textFormatting';

const MultipleChoiceTwo = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'multiple-choice-two', currentAnswers = {}, testType }) => {
  console.log('🎯 MultipleChoiceTwo rendered with template:', template);
  console.log('🎯 MultipleChoiceTwo testResults:', testResults);
  console.log('🎯 MultipleChoiceTwo testSubmitted:', testSubmitted);
  console.log('🎯 MultipleChoiceTwo currentAnswers:', currentAnswers);

  const handleAnswerChange = (questionNumber, selectedOptions) => {
    // Each question number gets its own answer
    const updatedAnswers = { ...currentAnswers, [questionNumber]: [...selectedOptions] };
    
    if (onAnswerChange) {
      onAnswerChange(updatedAnswers);
    }
  };

  const getOptionClass = (option, questionNumber, selectedOptions) => {
    if (!testSubmitted || !testResults) return '';
    
    const isSelected = selectedOptions.includes(option.letter);
    
    // For MultipleChoiceTwo, we should use the correct answers from the template
    // since they're the same for all questions in the group
    const correctAnswer = questionGroup.correctAnswers || [];
    const isCorrect = correctAnswer.includes(option.letter);
    
    if (isSelected && isCorrect) {
      return 'option-correct';
    } else if (isSelected && !isCorrect) {
      return 'option-incorrect';
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
    
    return !userAnswer || !Array.isArray(userAnswer) || userAnswer.length === 0;
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      // Handle both old and new result structures
      if (testResults.answers && testResults.answers[questionNumber]) {
        // New structure
        return testResults.answers[questionNumber] || [];
      } else if (testResults.givenAnswers) {
        // Old structure - find the answer for this question
        const testSubmission = testResults.givenAnswers.find(sub => 
          sub.testId === testResults.testId
        );
        if (testSubmission && testSubmission.answers) {
          return testSubmission.answers[questionNumber] || [];
        }
      }
      return [];
    }
    return currentAnswers[questionNumber] || [];
  };

  // Handle both old and new JSON formats
  const getQuestionData = () => {
    if (template.questionGroup) {
      // New format
      return {
        questionNumbers: template.questionGroup.questionNumbers,
        options: template.questionGroup.options,
        correctAnswers: template.questionGroup.correctAnswers,
        maxSelections: template.questionGroup.maxSelections || 2
      };
    } else if (template.questionBlock) {
      // Old format - convert to new format
      const firstQuestion = template.questionBlock[0];
      if (firstQuestion && firstQuestion.options) {
        return {
          questionNumbers: template.questionBlock.map(q => q.questionNumber),
          options: firstQuestion.options,
          correctAnswers: firstQuestion.answer || [],
          maxSelections: 2
        };
      }
    }
    return null;
  };

  const questionData = getQuestionData();

  if (!questionData) {
    console.log('❌ MultipleChoiceTwo: No valid question data found');
    console.log('❌ Template received:', template);
    return <div>No questions available</div>;
  }

  console.log('🎯 MultipleChoiceTwo: Question data:', questionData);
  console.log('🎯 MultipleChoiceTwo: Correct answers from template:', questionData.correctAnswers);

  const questionGroup = questionData;

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
        {/* Show main question text directly for all test types */}
        {template.mainQuestion && (
          <div className="main-question">
            <p className="main-question-text" dangerouslySetInnerHTML={{ 
              __html: processTextFormatting(template.mainQuestion) 
            }} />
          </div>
        )}
        
        {/* Show question numbers for the group */}
              <div className="question-numbers">
          <strong>Questions {questionGroup.questionNumbers.join(' & ')}.</strong>
              </div>
              
              {/* Render options only once */}
              <div className="options-container">
          {questionGroup.options.map((option) => {
            // Check if this option is selected in any of the questions
            const isSelectedInAnyQuestion = questionGroup.questionNumbers.some(questionNumber => {
              const selectedOptions = getAnswerValue(questionNumber);
              return selectedOptions.includes(option.letter);
            });
            
            // Get the combined option class from all questions
            let combinedOptionClass = '';
            if (testSubmitted && testResults) {
              // Check if this option is selected in any question
              const isSelectedInAnyQuestion = questionGroup.questionNumbers.some(questionNumber => {
                const selectedOptions = getAnswerValue(questionNumber);
                return selectedOptions.includes(option.letter);
              });
              
              if (isSelectedInAnyQuestion) {
                // If selected, determine if it's correct or incorrect
                const isCorrect = questionGroup.correctAnswers.includes(option.letter);
                console.log(`🔍 Option ${option.letter}: selected=${isSelectedInAnyQuestion}, correct=${isCorrect}, correctAnswers=${JSON.stringify(questionGroup.correctAnswers)}`);
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
                    questionGroup.questionNumbers.forEach(questionNumber => {
                      const currentSelectedOptions = getAnswerValue(questionNumber);
                      let newSelectedOptions;
                          
                          if (e.target.checked) {
                        // Add option if we have room
                        if (currentSelectedOptions.length < questionGroup.maxSelections) {
                          newSelectedOptions = [...currentSelectedOptions, option.letter];
                        } else {
                          // Replace the oldest selection if we're at max
                          newSelectedOptions = [...currentSelectedOptions.slice(1), option.letter];
                        }
                      } else {
                        // Remove option
                        newSelectedOptions = currentSelectedOptions.filter(opt => opt !== option.letter);
                      }
                      
                      console.log(`🔍 Question ${questionNumber} - New selected options:`, newSelectedOptions);
                      handleAnswerChange(questionNumber, newSelectedOptions);
                          });
                        }}
                      />
                      <span className="option-letter">{option.letter}.</span>
                      <span className="option-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>
              
              {/* Show single selection info for the entire group */}
              <div className="selection-info">
          <strong>Selected: {questionGroup.questionNumbers.reduce((total, questionNumber) => {
            const selectedOptions = getAnswerValue(questionNumber);
            return total + selectedOptions.length;
          }, 0)}/{questionGroup.maxSelections}</strong>
          
          {testSubmitted && testResults && (() => {
            // Check if any question in the group has answers
            const hasAnyAnswers = questionGroup.questionNumbers.some(questionNumber => {
              const answers = getAnswerValue(questionNumber);
              return answers && answers.length > 0;
            });

            return (
                  <div className="answer-feedback">
                {!hasAnyAnswers ? (
                  <span className="no-answer-given">
                    No answer given for Questions {questionGroup.questionNumbers.join(' & ')}
                  </span>
                ) : (
                        <span className="correct-answer">
                    Correct answers for Questions {questionGroup.questionNumbers.join(' & ')}: {questionGroup.correctAnswers.join(', ')}
                        </span>
                )}
              </div>
            );
          })()}
            </div>
      </div>
    </div>
  );
};

export default MultipleChoiceTwo; 
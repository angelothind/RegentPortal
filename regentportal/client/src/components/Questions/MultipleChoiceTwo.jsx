import React, { useState } from 'react';
import '../../styles/Questions/MultipleChoiceTwo.css';
import { processTextFormatting } from '../../utils/textFormatting';

const MultipleChoiceTwo = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'multiple-choice-two', currentAnswers = {} }) => {
  console.log('🎯 MultipleChoiceTwo rendered with template:', template);

  const handleAnswerChange = (questionNumber, value) => {
    const existingAnswers = currentAnswers[questionNumber] || [];
    let newAnswers;
    
    if (existingAnswers.includes(value)) {
      // Remove if already selected
      newAnswers = existingAnswers.filter(answer => answer !== value);
    } else {
      // Add if not selected (but limit to 2)
      if (existingAnswers.length < 2) {
        newAnswers = [...existingAnswers, value];
      } else {
        // Replace the first answer if already have 2
        newAnswers = [existingAnswers[1], value];
      }
    }
    
    const updatedAnswers = { ...currentAnswers, [questionNumber]: newAnswers };
    if (onAnswerChange) {
      onAnswerChange(updatedAnswers);
    }
  };

  const getOptionClass = (questionNumber, optionLetter) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    const userAnswer = testResults.answers?.[questionNumber] || [];
    const correctAnswer = result.correctAnswer || [];
    
    if (correctAnswer.includes(optionLetter)) {
      return 'option-correct';
    } else if (userAnswer.includes(optionLetter) && !result.isCorrect) {
      return 'option-incorrect';
    }
    
    return '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || [];
    }
    return currentAnswers[questionNumber] || [];
  };

  if (!template || !template.questionBlock) {
    console.log('❌ MultipleChoiceTwo: No template or questionBlock');
    return <div>No questions available</div>;
  }

  // Filter out section headings and only keep actual questions
  const actualQuestions = template.questionBlock.filter(q => 
    q.questionNumber && q.question && q.options && Array.isArray(q.options)
  );

  if (actualQuestions.length === 0) {
    console.log('❌ MultipleChoiceTwo: No valid questions found after filtering');
    return <div>No valid questions available</div>;
  }

  console.log('🎯 MultipleChoiceTwo: Rendering', actualQuestions.length, 'questions');

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
      
      {/* Section Title - check if first item is a section heading */}
      {template.questionBlock[0]?.sectionHeading && (
        <div className="section-title">
          <h4>{template.questionBlock[0].sectionHeading}</h4>
        </div>
      )}
      

      
      <div className="questions-section">
        {actualQuestions.map((question) => {
          const currentAnswers = getAnswerValue(question.questionNumber);
          return (
            <div key={question.questionNumber} className="question-item">
              <div className="question-text">
                <strong>{question.questionNumber}.</strong> {question.question}
              </div>
              <div className="options-container">
                {question.options.map((option) => {
                  const isSelected = currentAnswers.includes(option.letter);
                  return (
                    <label 
                      key={option.letter} 
                      className={`option-label ${isSelected ? 'selected' : ''} ${getOptionClass(question.questionNumber, option.letter)}`}
                    >
                      <input
                        type="checkbox"
                        name={`question-${question.questionNumber}`}
                        value={option.letter}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                        className="option-checkbox"
                        disabled={testSubmitted}
                      />
                      <span className="option-letter">{option.letter}.</span>
                      <span className="option-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>
              <div className="selection-info">
                Selected: {currentAnswers.join(', ') || 'None'} ({currentAnswers.length}/2)
              </div>
              {testSubmitted && testResults && (
                <div className="answer-feedback">
                  <span className="correct-answer">
                    Correct: {Array.isArray(testResults.correctAnswers?.[question.questionNumber]) 
                      ? testResults.correctAnswers[question.questionNumber].join(', ') 
                      : String(testResults.correctAnswers?.[question.questionNumber] || '')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceTwo; 
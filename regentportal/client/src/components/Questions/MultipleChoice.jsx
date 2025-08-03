import React, { useState } from 'react';
import '../../styles/Questions/MultipleChoice.css';

const MultipleChoice = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'multiple-choice', currentAnswers = {} }) => {
  console.log('🎯 MultipleChoice rendered with template:', template);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getOptionClass = (questionNumber, optionLetter) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    const userAnswer = testResults.answers?.[questionNumber];
    const correctAnswer = result.correctAnswer;
    
    if (optionLetter === correctAnswer) {
      return 'option-correct';
    } else if (optionLetter === userAnswer && !result.isCorrect) {
      return 'option-incorrect';
    }
    
    return '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return currentAnswers[questionNumber] || '';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ MultipleChoice: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 MultipleChoice: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="multiple-choice-container">
      {template.sectionTitle && (
        <div className="section-title">
          <h4>{template.sectionTitle}</h4>
        </div>
      )}
      
      <div className="questions-section">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="question-item">
            <div className="question-text">
              <strong>{question.questionNumber}.</strong> {question.question}
            </div>
            <div className="options-container">
              {question.options.map((option) => (
                <label 
                  key={option.letter} 
                  className={`option-label ${getOptionClass(question.questionNumber, option.letter)}`}
                >
                  <input
                    type="radio"
                    name={`${componentId}-question-${question.questionNumber}`}
                    value={option.letter}
                    checked={getAnswerValue(question.questionNumber) === option.letter}
                    onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                    className="option-radio"
                    disabled={testSubmitted}
                  />
                  <span className="option-letter">{option.letter}.</span>
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>
            {testSubmitted && testResults && (
              <div className="answer-feedback">
                <span className="correct-answer">
                  Correct: {String(testResults.correctAnswers?.[question.questionNumber] || '')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice; 
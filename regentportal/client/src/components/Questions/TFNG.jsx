import React, { useState } from 'react';
import '../../styles/Questions/TFNG.css';

const TFNG = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'tfng', currentAnswers = {} }) => {
  console.log('🎯 TFNG rendered with template:', template);
  console.log('🎯 TFNG testResults:', testResults);
  console.log('🎯 TFNG testSubmitted:', testSubmitted);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return currentAnswers[questionNumber] || '';
  };

  const getAnswerClass = (questionNumber, optionValue) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    const userAnswer = testResults.answers?.[questionNumber];
    const correctAnswer = result.correctAnswer;
    
    // If this option is the correct answer, show it as correct
    if (optionValue === correctAnswer) {
      return 'answer-correct';
    }
    // If this option is the user's answer but it's wrong, show it as incorrect
    else if (optionValue === userAnswer && !result.isCorrect) {
      return 'answer-incorrect';
    }
    
    return '';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ TFNG: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 TFNG: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="tfng-container">
      <div className="tfng-instructions">
        <h3 className="main-instruction">{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      <div className="answer-key">
        <div className="key-item">
          <strong>TRUE</strong>
          <span>if the statement agrees with the information</span>
        </div>
        <div className="key-item">
          <strong>FALSE</strong>
          <span>if the statement contradicts the information</span>
        </div>
        <div className="key-item">
          <strong>NOT GIVEN</strong>
          <span>if there is no information on this</span>
        </div>
      </div>
      
      <div className="tfng-questions">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="tfng-question-item">
            <div className="question-line">
              <span className="question-number">{question.questionNumber}.</span>
              <span className="question-text">{question.question}</span>
            </div>
            <div className="answer-options">
              <label className={`option-label ${getAnswerClass(question.questionNumber, 'TRUE')}`}>
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="TRUE"
                  checked={getAnswerValue(question.questionNumber) === 'TRUE'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                />
                <span>TRUE</span>
              </label>
              <label className={`option-label ${getAnswerClass(question.questionNumber, 'FALSE')}`}>
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="FALSE"
                  checked={getAnswerValue(question.questionNumber) === 'FALSE'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                />
                <span>FALSE</span>
              </label>
              <label className={`option-label ${getAnswerClass(question.questionNumber, 'NOT GIVEN')}`}>
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="NOT GIVEN"
                  checked={getAnswerValue(question.questionNumber) === 'NOT GIVEN'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                />
                <span>NOT GIVEN</span>
              </label>
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

export default TFNG; 
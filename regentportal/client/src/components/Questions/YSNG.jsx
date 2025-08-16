import React, { useState } from 'react';
import '../../styles/Questions/YSNG.css';

const YSNG = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'ysng', currentAnswers = {} }) => {
  console.log('🎯 YSNG rendered with template:', template);
  console.log('🎯 YSNG testResults:', testResults);
  console.log('🎯 YSNG testSubmitted:', testSubmitted);

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
    console.log('❌ YSNG: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 YSNG: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="ysng-container">
      <div className="ysng-instructions">
        <h3 className="main-instruction">{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      <div className="answer-key">
        <div className="key-item">
          <strong>YES</strong>
          <span>if the statement agrees with the claims of the writer</span>
        </div>
        <div className="key-item">
          <strong>NO</strong>
          <span>if the statement contradicts the claims of the writer</span>
        </div>
        <div className="key-item">
          <strong>NOT GIVEN</strong>
          <span>if it is impossible to say what the writer thinks about this</span>
        </div>
      </div>
      
      <div className="ysng-questions">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="ysng-question-item">
            <div className="question-line">
              <span className="question-number">{question.questionNumber}.</span>
              <span className="question-text">{question.question}</span>
            </div>
            <div className="answer-options">
              <label className={`option-label ${getAnswerClass(question.questionNumber, 'YES')}`}>
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="YES"
                  checked={getAnswerValue(question.questionNumber) === 'YES'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                />
                <span>YES</span>
              </label>
              <label className={`option-label ${getAnswerClass(question.questionNumber, 'NO')}`}>
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="NO"
                  checked={getAnswerValue(question.questionNumber) === 'NO'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                />
                <span>NO</span>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default YSNG; 
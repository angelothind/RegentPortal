import React, { useState } from 'react';
import '../../styles/Questions/TFNG.css';

const TFNG = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'tfng', currentAnswers = {} }) => {
  console.log('🎯 TFNG rendered with template:', template);
  console.log('🎯 TFNG testResults:', testResults);
  console.log('🎯 TFNG testSubmitted:', testSubmitted);

  // Determine if this is YSNG or TFNG based on the subType field, fallback to answer detection
  const isYSNG = template?.subType === 'YSNG' || 
    (template?.correctAnswers && 
     Object.values(template.correctAnswers).some(answer => answer === 'YES' || answer === 'NO'));
  
  const questionType = isYSNG ? 'YSNG' : 'TFNG';

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

  console.log('🎯 TFNG: Rendering', template.questionBlock.length, 'questions as', questionType);

  // Define answer options and explanations based on question type
  const answerOptions = isYSNG 
    ? [
        { value: 'YES', label: 'YES', explanation: 'if the statement agrees with the claims of the writer' },
        { value: 'NO', label: 'NO', explanation: 'if the statement contradicts the claims of the writer' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN', explanation: 'if it is impossible to say what the writer thinks about this' }
      ]
    : [
        { value: 'TRUE', label: 'TRUE', explanation: 'if the statement agrees with the information' },
        { value: 'FALSE', label: 'FALSE', explanation: 'if the statement contradicts the information' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN', explanation: 'if there is no information on this' }
      ];

  return (
    <div className="tfng-container">
      <div className="tfng-instructions">
        <h3 className="main-instruction">{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      <div className="answer-key">
        {answerOptions.map((option) => (
          <div key={option.value} className="key-item">
            <strong>{option.label}</strong>
            <span>{option.explanation}</span>
          </div>
        ))}
      </div>
      
      <div className="tfng-questions">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="tfng-question-item">
            <div className="question-line">
              <span className="question-number">{question.questionNumber}.</span>
              <span className="question-text">{question.question}</span>
            </div>
            <div className="answer-options">
              {answerOptions.map((option) => (
                <label key={option.value} className={`option-label ${getAnswerClass(question.questionNumber, option.value)}`}>
                  <input
                    type="radio"
                    name={`question-${question.questionNumber}`}
                    value={option.value}
                    checked={getAnswerValue(question.questionNumber) === option.value}
                    onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                    disabled={testSubmitted}
                  />
                  <span>{option.label}</span>
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

export default TFNG; 
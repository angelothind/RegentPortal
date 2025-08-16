import React, { useState } from 'react';
import '../../styles/Questions/Matching.css';

const Matching = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'matching', currentAnswers = {} }) => {
  console.log('🎯 Matching rendered with template:', template);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getAnswerClass = (questionNumber) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    return result.isCorrect ? 'answer-correct' : 'answer-incorrect';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return currentAnswers[questionNumber] || '';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ Matching: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 Matching: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="matching-container">
      <div className="instructions">
        <h3 className="main-instruction">{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      {template.opinionsBox && (
        <div className="opinions-box">
          <h4 className="opinions-title">{template.opinionsBox.title}</h4>
          <div className="opinions-list">
            {template.opinionsBox.options.map((option) => (
              <div key={option.letter} className="opinion-item">
                <span className="opinion-letter">{option.letter}</span>
                <span className="opinion-text">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="questions-section">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="question-item">
            <div className="question-text">
              <strong>{question.questionNumber}.</strong> {question.question}
            </div>
            <div className="answer-input-container">
              <input
                type="text"
                className={`matching-answer-input ${getAnswerClass(question.questionNumber)}`}
                placeholder=""
                value={getAnswerValue(question.questionNumber)}
                onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value.toUpperCase())}
                maxLength="1"
                disabled={testSubmitted}
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
              />
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

export default Matching; 
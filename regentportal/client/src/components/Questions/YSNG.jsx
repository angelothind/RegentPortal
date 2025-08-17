import React, { useState } from 'react';
import '../../styles/Questions/YSNG.css';
import { processTextFormatting } from '../../utils/textFormatting';

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
    
    // Only highlight incorrect user selections in red
    if (optionValue === userAnswer && !result.isCorrect) {
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
        <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.introInstruction) 
        }} />
        <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.formattingInstruction) 
        }} />
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
              {(() => {
                const yesClass = getAnswerClass(question.questionNumber, 'YES');
                const noClass = getAnswerClass(question.questionNumber, 'NO');
                const notGivenClass = getAnswerClass(question.questionNumber, 'NOT GIVEN');
                
                return (
                  <>
                    <label className={`option-label ${yesClass}`}>
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
                    <label className={`option-label ${noClass}`}>
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
                    <label className={`option-label ${notGivenClass}`}>
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
                  </>
                );
              })()}
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

export default YSNG; 
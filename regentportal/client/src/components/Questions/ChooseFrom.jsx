import React, { useState } from 'react';
import '../../styles/Questions/ChooseFrom.css';

const ChooseFrom = ({ template, onAnswerChange, testResults, testSubmitted, testType, componentId = 'choose-from' }) => {
  const [answers, setAnswers] = useState({});

  console.log('🎯 ChooseFrom rendered with template:', template);
  console.log('🎯 ChooseFrom testResults:', testResults);
  console.log('🎯 ChooseFrom testSubmitted:', testSubmitted);

  // Function to strip ** markers from text and convert to bold parentheses format
  const stripMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\*\*(\d+)\*\*/g, '<strong>($1)</strong>');
  };

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...answers, [questionNumber]: value };
    setAnswers(newAnswers);
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getAnswerClass = (questionNumber) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    console.log(`🎯 getAnswerClass for question ${questionNumber}:`, result);
    if (!result) return '';
    
    return result.isCorrect ? 'answer-correct' : 'answer-incorrect';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return answers[questionNumber] || '';
  };

  if (!template || !template.summaryText) {
    console.log('❌ ChooseFrom: No template or summaryText');
    return <div>No questions available</div>;
  }

  console.log('🎯 ChooseFrom: Rendering summary completion with options');

  return (
    <div className="choose-from-container">
      <div className="instructions">
        <h3 className="main-instruction">{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      {template.mainQuestion && (
        <div className="main-question">
          <h4>{template.mainQuestion}</h4>
        </div>
      )}
      
      <div className="summary-section">
        <div className="summary-text">
          {stripMarkdownBold(template.summaryText).split('________').map((part, index, array) => (
            <span key={index}>
              <span dangerouslySetInnerHTML={{ __html: part || '' }} />
              {index < array.length - 1 && (
                <select
                  className={`answer-select ${getAnswerClass(template.questionBlock[index]?.questionNumber)}`}
                  value={getAnswerValue(template.questionBlock[index]?.questionNumber)}
                  onChange={(e) => handleAnswerChange(template.questionBlock[index]?.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                >
                  <option value="">Choose...</option>
                  {template.options.map((option) => (
                    <option key={option.letter} value={option.letter}>
                      {option.letter}: {option.text}
                    </option>
                  ))}
                </select>
              )}
            </span>
          ))}
        </div>
      </div>

      {testSubmitted && testResults && (
        <div className="answer-feedback-section">
          {template.questionBlock.map((question) => (
            <div key={question.questionNumber} className="feedback-item">
              <span className="question-number">Question {question.questionNumber}:</span>
              <span className="correct-answer">
                Correct: {String(testResults.correctAnswers?.[question.questionNumber] || '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChooseFrom; 
import React, { useState } from 'react';
import '../../styles/Questions/SummaryCompletion.css';
import { processTextFormatting } from '../../utils/textFormatting';

const SummaryCompletion = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'summary-completion', currentAnswers = {} }) => {
  console.log('🎯 SummaryCompletion rendered with template:', template);
  console.log('🎯 SummaryCompletion testResults:', testResults);
  console.log('🎯 SummaryCompletion testSubmitted:', testSubmitted);

  // Function to strip ** markers from text and convert to bold parentheses format
  const stripMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\*\*(\d+)\*\*/g, '<strong>($1)</strong>');
  };

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getAnswerClass = (questionNumber) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    console.log(`🎯 getAnswerClass for question ${questionNumber}:`, result);
    
    // If there's a result, use it
    if (result) {
      return result.isCorrect ? 'answer-correct' : 'answer-incorrect';
    }
    
    // If there's no result but we have correct answers, mark as incorrect (unanswered)
    if (testResults.correctAnswers?.[questionNumber]) {
      return 'answer-incorrect';
    }
    
    return '';
  };

  const isQuestionUnanswered = (questionNumber) => {
    if (!testSubmitted || !testResults) return false;
    
    const userAnswer = testResults.answers?.[questionNumber];
    return !userAnswer || userAnswer === '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      const userAnswer = testResults.answers?.[questionNumber];
      // If no answer was given, return empty string so we can show placeholder
      if (!userAnswer || userAnswer === '') {
        return '';
      }
      return userAnswer;
    }
    return currentAnswers[questionNumber] || '';
  };

  const getInputPlaceholder = (questionNumber) => {
    if (testSubmitted && testResults) {
      const userAnswer = testResults.answers?.[questionNumber];
      if (!userAnswer || userAnswer === '') {
        return 'No answer given';
      }
    }
    return 'Answer';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ SummaryCompletion: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 SummaryCompletion: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="summary-completion-container">
      <div className="instructions">
        <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.introInstruction) 
        }} />
        <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.formattingInstruction) 
        }} />
      </div>
      
      <div className="summary-section">
        <div className="summary-text">
          {template.summaryText && stripMarkdownBold(template.summaryText).split('________').map((part, index, array) => (
            <span key={index}>
              <span dangerouslySetInnerHTML={{ __html: part || '' }} />
              {index < array.length - 1 && (
                <input
                  type="text"
                  className={`answer-input ${getAnswerClass(template.questionBlock[index]?.questionNumber)}`}
                  placeholder={getInputPlaceholder(template.questionBlock[index]?.questionNumber)}
                  value={getAnswerValue(template.questionBlock[index]?.questionNumber)}
                  onChange={(e) => handleAnswerChange(template.questionBlock[index]?.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
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

export default SummaryCompletion; 
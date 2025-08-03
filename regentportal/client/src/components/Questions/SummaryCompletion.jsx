import React, { useState } from 'react';
import '../../styles/Questions/SummaryCompletion.css';

const SummaryCompletion = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'summary-completion' }) => {
  const [answers, setAnswers] = useState({});

  console.log('🎯 SummaryCompletion rendered with template:', template);
  console.log('🎯 SummaryCompletion testResults:', testResults);
  console.log('🎯 SummaryCompletion testSubmitted:', testSubmitted);

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

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return answers[questionNumber] || '';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ SummaryCompletion: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 SummaryCompletion: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="summary-completion-container">
      <div className="instructions">
        <h3 className="main-instruction">{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
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
                  placeholder="Answer"
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
              {testResults.correctAnswers?.[question.questionNumber] ? (
                <span className="correct-answer">
                  Correct: {String(testResults.correctAnswers[question.questionNumber])}
                </span>
              ) : testResults.answers?.[question.questionNumber] ? (
                <span className="no-answer-given">
                  No answer given
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummaryCompletion; 
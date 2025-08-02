import React, { useState } from 'react';
import '../../styles/Questions/ChooseXWords.css';

const ChooseXWords = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'choose-x-words' }) => {
  const [answers, setAnswers] = useState({});

  console.log('🎯 ChooseXWords rendered with template:', template);
  console.log('🎯 ChooseXWords testResults:', testResults);
  console.log('🎯 ChooseXWords testSubmitted:', testSubmitted);

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

  if (!template || !template.questionBlock) {
    console.log('❌ ChooseXWords: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 ChooseXWords: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="choose-x-words-container">
      <div className="instructions">
        <h3>{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      <div className="questions-section">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="question-item">
            <div className="question-text">
              {stripMarkdownBold(question.question || '').split('________').map((part, index, array) => (
                <span key={index}>
                  <span dangerouslySetInnerHTML={{ __html: part || '' }} />
                  {index < array.length - 1 && (
                    <input
                      type="text"
                      className={`answer-input ${getAnswerClass(question.questionNumber)}`}
                      placeholder="Answer"
                      value={getAnswerValue(question.questionNumber)}
                      onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
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
            {testSubmitted && testResults && (
              <div className="answer-feedback">
                {testResults.answers?.[question.questionNumber] ? (
                  <span className="correct-answer">
                    Correct: {String(testResults.correctAnswers?.[question.questionNumber] || '')}
                  </span>
                ) : (
                  <span className="no-answer-given">
                    No answer given
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseXWords;

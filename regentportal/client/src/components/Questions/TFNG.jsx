import React, { useState } from 'react';
import '../../styles/Questions/TFNG.css';

const TFNG = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'tfng' }) => {
  const [answers, setAnswers] = useState({});

  console.log('🎯 TFNG rendered with template:', template);
  console.log('🎯 TFNG testResults:', testResults);
  console.log('🎯 TFNG testSubmitted:', testSubmitted);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...answers, [questionNumber]: value };
    setAnswers(newAnswers);
    if (onAnswerChange) {
      onAnswerChange(questionNumber, value);
    }
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return answers[questionNumber] || '';
  };

  const getAnswerClass = (questionNumber) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    return result.isCorrect ? 'answer-correct' : 'answer-incorrect';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ TFNG: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 TFNG: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="tfng-container">
      <div className="tfng-instructions">
        <h3>{template.introInstruction}</h3>
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
            <div className="question-number">{question.questionNumber}.</div>
            <div className="question-text">{question.question}</div>
            <div className="answer-options">
              <label className="option-label">
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="TRUE"
                  checked={getAnswerValue(question.questionNumber) === 'TRUE'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                  className={getAnswerClass(question.questionNumber)}
                />
                <span>TRUE</span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="FALSE"
                  checked={getAnswerValue(question.questionNumber) === 'FALSE'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                  className={getAnswerClass(question.questionNumber)}
                />
                <span>FALSE</span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value="NOT GIVEN"
                  checked={getAnswerValue(question.questionNumber) === 'NOT GIVEN'}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  disabled={testSubmitted}
                  className={getAnswerClass(question.questionNumber)}
                />
                <span>NOT GIVEN</span>
              </label>
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

export default TFNG; 
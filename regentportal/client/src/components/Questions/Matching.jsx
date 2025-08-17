import React, { useState } from 'react';
import '../../styles/Questions/Matching.css';
import { processTextFormatting } from '../../utils/textFormatting';

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

  // Filter out section headings and only keep actual questions
  const actualQuestions = template.questionBlock.filter(q => 
    q.questionNumber && q.question
  );

  if (actualQuestions.length === 0) {
    console.log('❌ Matching: No valid questions found after filtering');
    return <div>No valid questions available</div>;
  }

  console.log('🎯 Matching: Rendering', actualQuestions.length, 'questions');

  return (
    <div className="matching-container">
      <div className="instructions">
        <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.introInstruction) 
        }} />
        <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.formattingInstruction) 
        }} />
      </div>
      
      {/* Section Title - check if first item is a section heading */}
      {template.questionBlock[0]?.sectionHeading && (
        <div className="section-title">
          <h4>{template.questionBlock[0].sectionHeading}</h4>
        </div>
      )}
      
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
        {actualQuestions.map((question) => (
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
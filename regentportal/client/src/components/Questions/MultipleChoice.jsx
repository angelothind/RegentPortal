import React, { useState } from 'react';
import '../../styles/Questions/MultipleChoice.css';
import { processTextFormatting } from '../../utils/textFormatting';

const MultipleChoice = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'multiple-choice', currentAnswers = {} }) => {
  console.log('🎯 MultipleChoice rendered with template:', template);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getOptionClass = (questionNumber, optionLetter) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    const userAnswer = testResults.answers?.[questionNumber];
    const correctAnswer = result.correctAnswer;
    
    if (optionLetter === correctAnswer) {
      return 'option-correct';
    } else if (optionLetter === userAnswer && !result.isCorrect) {
      return 'option-incorrect';
    }
    
    return '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return currentAnswers[questionNumber] || '';
  };

  if (!template || !template.questionBlock) {
    console.log('❌ MultipleChoice: No template or questionBlock');
    return <div>No questions available</div>;
  }

  // Filter out section headings and only keep actual questions with options
  const actualQuestions = template.questionBlock.filter(q => 
    q.questionNumber && q.question && q.options && Array.isArray(q.options) && q.options.length > 0
  );

  if (actualQuestions.length === 0) {
    console.log('❌ MultipleChoice: No valid multiple choice questions found');
    return (
      <div className="error-container">
        <h3>No Multiple Choice Questions</h3>
        <p>This section contains other question types that are not multiple choice.</p>
        <p>Question types in this section:</p>
        <ul>
          {template.questionBlock.map((q, index) => (
            <li key={index}>
              {q.sectionHeading ? `Section: ${q.sectionHeading}` : 
               q.questionNumber ? `Question ${q.questionNumber}: ${q.questionType || 'Unknown type'}` : 
               'Unknown item'}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  console.log('🎯 MultipleChoice: Rendering', actualQuestions.length, 'multiple choice questions');
  console.log('🎯 MultipleChoice: Template structure:', {
    hasTemplate: !!template,
    hasQuestionBlock: !!template?.questionBlock,
    questionBlockLength: template?.questionBlock?.length,
    actualQuestionsLength: actualQuestions.length,
    firstQuestion: actualQuestions?.[0],
    firstQuestionOptions: actualQuestions?.[0]?.options
  });

  return (
    <div className="multiple-choice-container">
      {/* Instructions */}
      {template.introInstruction && (
        <div className="instructions">
          <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
            __html: processTextFormatting(template.introInstruction) 
          }} />
          {template.formattingInstruction && (
            <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
              __html: processTextFormatting(template.formattingInstruction) 
            }} />
          )}
        </div>
      )}
      
      {/* Section Title - check if first item is a section heading */}
      {template.questionBlock[0]?.sectionHeading && (
        <div className="section-title">
          <h4>{template.questionBlock[0].sectionHeading}</h4>
        </div>
      )}
      
      <div className="questions-section">
        {actualQuestions.map((question) => (
          <div key={question.questionNumber} className="question-item">
            <div className="question-header">
              <div className="question-text">
                <strong>{question.questionNumber}.</strong> {question.question}
              </div>
            </div>
            <div className="question-options">
              {question.options && Array.isArray(question.options) ? (
                <div className="options-container">
                  {question.options.map((option) => (
                    <label 
                      key={option.letter} 
                      className={`option-label ${getOptionClass(question.questionNumber, option.letter)}`}
                    >
                      <input
                        type="radio"
                        name={`${componentId}-question-${question.questionNumber}`}
                        value={option.letter}
                        checked={getAnswerValue(question.questionNumber) === option.letter}
                        onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                        className="option-radio"
                        disabled={testSubmitted}
                      />
                      <span className="option-letter">{option.letter}.</span>
                      <span className="option-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="error-message">
                  <p>Error: Question options not found for question {question.questionNumber}</p>
                  <details>
                    <summary>Debug info</summary>
                    <pre>{JSON.stringify(question, null, 2)}</pre>
                  </details>
                </div>
              )}
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

export default MultipleChoice; 
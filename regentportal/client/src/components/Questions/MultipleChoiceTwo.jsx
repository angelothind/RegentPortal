import React, { useState } from 'react';
import '../../styles/Questions/MultipleChoiceTwo.css';

const MultipleChoiceTwo = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'multiple-choice-two' }) => {
  const [answers, setAnswers] = useState({});

  console.log('🎯 MultipleChoiceTwo rendered with template:', template);

  const handleAnswerChange = (questionNumber, value) => {
    const currentAnswers = answers[questionNumber] || [];
    let newAnswers;
    
    if (currentAnswers.includes(value)) {
      // Remove if already selected
      newAnswers = currentAnswers.filter(answer => answer !== value);
    } else {
      // Add if not selected (but limit to 2)
      if (currentAnswers.length < 2) {
        newAnswers = [...currentAnswers, value];
      } else {
        // Replace the first answer if already have 2
        newAnswers = [currentAnswers[1], value];
      }
    }
    
    const updatedAnswers = { ...answers, [questionNumber]: newAnswers };
    setAnswers(updatedAnswers);
    if (onAnswerChange) {
      onAnswerChange(updatedAnswers);
    }
  };

  const getOptionClass = (questionNumber, optionLetter) => {
    if (!testSubmitted || !testResults) return '';
    
    const result = testResults.results?.[questionNumber];
    if (!result) return '';
    
    const userAnswer = testResults.answers?.[questionNumber] || [];
    const correctAnswer = result.correctAnswer || [];
    
    if (correctAnswer.includes(optionLetter)) {
      return 'option-correct';
    } else if (userAnswer.includes(optionLetter) && !result.isCorrect) {
      return 'option-incorrect';
    }
    
    return '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || [];
    }
    return answers[questionNumber] || [];
  };

  if (!template || !template.questionBlock) {
    console.log('❌ MultipleChoiceTwo: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 MultipleChoiceTwo: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="multiple-choice-two-container">
      <div className="instructions">
        <h3>{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      <div className="questions-section">
        {template.questionBlock.map((question) => {
          const currentAnswers = getAnswerValue(question.questionNumber);
          return (
            <div key={question.questionNumber} className="question-item">
              <div className="question-text">
                <strong>{question.questionNumber}.</strong> {question.question}
              </div>
              <div className="options-container">
                {question.options.map((option) => {
                  const isSelected = currentAnswers.includes(option.letter);
                  return (
                    <label 
                      key={option.letter} 
                      className={`option-label ${isSelected ? 'selected' : ''} ${getOptionClass(question.questionNumber, option.letter)}`}
                    >
                      <input
                        type="checkbox"
                        name={`question-${question.questionNumber}`}
                        value={option.letter}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                        className="option-checkbox"
                        disabled={testSubmitted}
                      />
                      <span className="option-letter">{option.letter}.</span>
                      <span className="option-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>
              <div className="selection-info">
                Selected: {currentAnswers.join(', ') || 'None'} ({currentAnswers.length}/2)
              </div>
              {testSubmitted && testResults && (
                <div className="answer-feedback">
                  {testResults.answers?.[question.questionNumber]?.length > 0 ? (
                                      <span className="correct-answer">
                    Correct: {Array.isArray(testResults.correctAnswers?.[question.questionNumber]) 
                      ? testResults.correctAnswers[question.questionNumber].join(', ') 
                      : String(testResults.correctAnswers?.[question.questionNumber] || '')}
                  </span>
                  ) : (
                    <span className="no-answer-given">
                      No answer given
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceTwo; 
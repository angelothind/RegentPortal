import React, { useState } from 'react';
import '../../styles/Questions/MapLabeling.css';

const MapLabeling = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'map-labeling' }) => {
  const [answers, setAnswers] = useState({});

  console.log('🎯 MapLabeling rendered with template:', template);

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
    console.log('❌ MapLabeling: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 MapLabeling: Rendering', template.questionBlock.length, 'questions');

  return (
    <div className="map-labeling-container">
      <div className="instructions">
        <h3>{template.introInstruction}</h3>
        <p className="formatting-instruction">{template.formattingInstruction}</p>
      </div>
      
      {template.mapTitle && (
        <div className="map-title">
          <h4>{template.mapTitle}</h4>
        </div>
      )}
      
      <div className="map-section">
        <div className="map-image-container">
          <img 
            src={`/assets/Books/Book19/Test1/questions/Listening/${template.mapImage}`} 
            alt={template.mapTitle}
            className="map-image"
          />
        </div>
      </div>
      
      <div className="questions-section">
        {template.questionBlock.map((question) => (
          <div key={question.questionNumber} className="question-item">
            <div className="question-text">
              <strong>{question.questionNumber}.</strong> {question.question}
            </div>
            <div className="answer-input-container">
              <input
                type="text"
                className={`map-answer-input ${getAnswerClass(question.questionNumber)}`}
                placeholder="A-H"
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

export default MapLabeling; 
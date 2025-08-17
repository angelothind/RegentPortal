import React from 'react';
import '../../styles/Questions/FlowchartCompletion.css';
import { processTextFormatting } from '../../utils/textFormatting';

const FlowchartCompletion = ({ template, onAnswerChange, testResults, testSubmitted, componentId = 'flowchart-completion', currentAnswers = {} }) => {
  console.log('🎯 FlowchartCompletion rendered with template:', template);

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
    console.log('❌ FlowchartCompletion: No template or questionBlock');
    return <div>No questions available</div>;
  }

  // Filter out section headings and only keep actual questions
  const actualQuestions = template.questionBlock.filter(q => 
    q.questionNumber && q.question
  );

  if (actualQuestions.length === 0) {
    console.log('❌ FlowchartCompletion: No valid questions found after filtering');
    return <div>No valid questions available</div>;
  }

  console.log('🎯 FlowchartCompletion: Rendering', actualQuestions.length, 'questions');

  return (
    <div className="flowchart-completion-container">
      {/* Instructions */}
      <div className="instructions">
        {template.introInstruction && (
          <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
            __html: processTextFormatting(template.introInstruction) 
          }} />
        )}
        {template.formattingInstruction && (
          <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
            __html: processTextFormatting(template.formattingInstruction) 
          }} />
        )}
      </div>
      
      {/* Main Content - Flowchart and Options Side by Side */}
      <div className="main-content">
        {/* Flowchart Section */}
        <div className="flowchart-section">
          <div className="flowchart-container">
            {actualQuestions.map((question, index) => (
              <div key={question.questionNumber} className="flowchart-step">
                <div className="flowchart-box">
                  <div className="question-content">
                    {question.question && question.question.split('________').map((part, partIndex, array) => (
                      <span key={partIndex}>
                        <span dangerouslySetInnerHTML={{ 
                          __html: processTextFormatting(part || '') 
                        }} />
                        {partIndex < array.length - 1 && (
                          <input
                            type="text"
                            className={`flowchart-answer-input ${getAnswerClass(question.questionNumber)}`}
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
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Arrow connector (except for last item) */}
                {index < actualQuestions.length - 1 && (
                  <div className="flowchart-arrow">
                    <div className="arrow-line"></div>
                    <div className="arrow-head"></div>
                  </div>
                )}
                
                {/* Answer feedback */}
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
        
        {/* Options Box */}
        {template.opinionsBox && template.opinionsBox.title && template.opinionsBox.options && (
          <div className="options-box">
            <h4 className="options-title">{template.opinionsBox.title}</h4>
            <div className="options-grid">
              {template.opinionsBox.options.map((option) => (
                <div key={option.letter} className="option-item">
                  <span className="option-letter">{option.letter}</span>
                  <span className="option-text">{option.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowchartCompletion; 
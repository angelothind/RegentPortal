import React, { useState } from 'react';
import '../../styles/Questions/TableCompletion.css';
import { processTextFormatting } from '../../utils/textFormatting';

const TableCompletion = ({ template, onAnswerChange, testResults, testSubmitted, testType, componentId = 'table-completion', currentAnswers = {} }) => {
  console.log('🎯 TableCompletion rendered with template:', template);
  console.log('🎯 TableCompletion testResults:', testResults);
  console.log('🎯 TableCompletion testSubmitted:', testSubmitted);

  // Function to strip ** markers from text and convert to bold parentheses format
  const stripMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\*\*(\d+)\*\*/g, '<strong>($1)</strong>');
  };

  // Function to convert \n to <br> tags for line breaks
  const processNewlines = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\n/g, '<br>');
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
    if (!result) return '';
    
    return result.isCorrect ? 'answer-correct' : 'answer-incorrect';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      return testResults.answers?.[questionNumber] || '';
    }
    return currentAnswers[questionNumber] || '';
  };

  if (!template || !template.tableData) {
    console.log('❌ TableCompletion: No template or tableData');
    return <div>No table data available</div>;
  }

  console.log('🎯 TableCompletion: Rendering table with', template.tableData.length, 'rows');
  console.log('🎯 TableCompletion: testType =', testType);
  console.log('🎯 TableCompletion: template =', template);

  // For Listening tests, render with Listening-specific styling
  if (testType === 'Listening' || testType === 'listening' || testType === 'LISTENING') {
    return (
      <div className="listening-table-container" style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}>
        
        {/* Instructions - keep them visible */}
        <div className="instructions" style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '6px'
        }}>
          <h3 className="main-instruction" style={{
            margin: '0 0 8px 0',
            color: '#333',
            fontSize: '1rem',
            fontWeight: '600'
          }} dangerouslySetInnerHTML={{ 
            __html: processTextFormatting(template.introInstruction) 
          }} />
          {template.formattingInstruction && (
            <p className="formatting-instruction" style={{
              margin: '0',
              color: '#666',
              fontSize: '0.9rem',
              fontStyle: 'italic'
            }} dangerouslySetInnerHTML={{ 
              __html: processTextFormatting(template.formattingInstruction) 
            }} />
          )}
        </div>
        
        {template.tableTitle && (
          <h4 className="listening-table-title" style={{
            margin: '0 0 20px 0',
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {template.tableTitle}
          </h4>
        )}
        
        {/* Render the actual HTML table */}
        <div className="listening-table-wrapper">
          <table className="listening-table">
            <thead>
              <tr>
                {template.tableStructure?.headers?.map((header, index) => (
                  <th key={index} className="table-header">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {template.tableData.map((rowData, rowIndex) => (
                <tr key={rowIndex} className="table-row">
                  {rowData.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="table-cell">
                      {cell.type === 'section-heading' ? (
                        <div className="section-heading-cell" style={{
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          color: '#25245D',
                          fontWeight: '600',
                          padding: '8px 0'
                        }}>
                          <strong>{cell.content}</strong>
                        </div>
                      ) : cell.type === 'question' ? (
                        <div className="question-cell">
                          {processNewlines(processTextFormatting(cell.content)).split(/\[INPUT_(\d+)\]/).map((part, partIndex, array) => {
                            // Check if this part is a question number placeholder
                            const questionMatch = part.match(/^(\d+)$/);
                            if (questionMatch) {
                              const questionNumber = questionMatch[1];
                              return (
                                <input
                                  key={partIndex}
                                  type="text"
                                  className={`listening-table-answer-input ${getAnswerClass(questionNumber)}`}
                                  style={{
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '8px 12px',
                                    fontSize: '0.9rem',
                                    minWidth: '120px',
                                    backgroundColor: 'white',
                                    color: '#333',
                                    transition: 'border-color 0.2s ease'
                                  }}
                                  placeholder="Answer"
                                  value={getAnswerValue(questionNumber)}
                                  onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
                                  disabled={testSubmitted}
                                  autoComplete="off"
                                  data-form-type="other"
                                  data-lpignore="true"
                                  data-1p-ignore="true"
                                />
                              );
                            }
                            // Regular text content
                            return (
                              <span key={partIndex} dangerouslySetInnerHTML={{ __html: part }} />
                            );
                          })}
                          {testSubmitted && testResults && (
                            <div className="answer-feedback">
                              <span className="correct-answer">
                                Correct: {String(testResults.correctAnswers?.[cell.questionNumber] || '')}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-cell">
                          {cell.content}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // For Reading tests, use the original styling
  return (
    <div className={`table-completion-container ${testType === 'Reading' ? 'reading-test' : ''}`}>
      <div className="instructions">
        <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.introInstruction) 
        }} />
        <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.formattingInstruction) 
        }} />
      </div>
      
      <div className="table-container">
        {template.tableTitle && (
          <h4 className="table-title">{template.tableTitle}</h4>
        )}
        
        {/* Render the actual HTML table */}
        <div className="table-wrapper">
          <table className="completion-table">
            <thead>
              <tr>
                {template.tableStructure?.headers?.map((header, index) => (
                  <th key={index} className="table-header">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {template.tableData.map((rowData, rowIndex) => (
                <tr key={rowIndex} className="table-row">
                  {rowData.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="table-cell">
                      {cell.type === 'section-heading' ? (
                        <div className="section-heading-cell" style={{
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          color: '#25245D',
                          fontWeight: '600',
                          padding: '8px 0'
                        }}>
                          <strong>{cell.content}</strong>
                        </div>
                      ) : cell.type === 'question' ? (
                        <div className="question-cell">
                          {processNewlines(stripMarkdownBold(cell.content)).split('________').map((part, partIndex, array) => (
                            <span key={partIndex}>
                              <span dangerouslySetInnerHTML={{ __html: part }} />
                              {partIndex < array.length - 1 && (
                                <input
                                  type="text"
                                  className={`table-answer-input ${getAnswerClass(cell.questionNumber)}`}
                                  placeholder="Answer"
                                  value={getAnswerValue(cell.questionNumber)}
                                  onChange={(e) => handleAnswerChange(cell.questionNumber, e.target.value)}
                                  disabled={testSubmitted}
                                  autoComplete="off"
                                  data-form-type="other"
                                  data-lpignore="true"
                                  data-1p-ignore="true"
                                />
                              )}
                            </span>
                          ))}
                          {testSubmitted && testResults && (
                            <div className="answer-feedback">
                              <span className="correct-answer">
                                Correct: {String(testResults.correctAnswers?.[cell.questionNumber] || '')}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-cell">
                          {cell.content}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableCompletion; 
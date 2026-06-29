import React from 'react';
import '../../styles/Questions/TableCompletion.css';
import { processTextFormatting } from '../../utils/textFormatting';

const getInputKey = (questionNumber, partIndex, blankCount) => (
  blankCount === 1 ? questionNumber : `${questionNumber}_${partIndex}`
);

const getMarkingQuestionNumber = (questionNumber, partIndex, blankCount) => {
  if (blankCount > 1 && typeof questionNumber === 'string' && questionNumber.includes('-')) {
    const [startNum] = questionNumber.split('-').map(Number);
    return startNum + partIndex;
  }
  return questionNumber;
};

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

  // Function to transform backend data for range questions
  const transformBackendData = (originalResults, template) => {
    if (!originalResults || !template?.tableData) return originalResults;
    
    const transformedResults = { ...originalResults };
    
    console.log('🎯 Template structure for transformation:', template.tableData);
    
    // Look for range questions in the template
    template.tableData.forEach((rowData, rowIndex) => {
      rowData.cells.forEach((cell, cellIndex) => {
        console.log(`🎯 Cell ${rowIndex}-${cellIndex}:`, {
          type: cell.type,
          questionNumber: cell.questionNumber,
          questionNumberType: typeof cell.questionNumber,
          // Don't use JSON answers for marking
        });
        
        if (cell.type === 'question' && cell.questionNumber && typeof cell.questionNumber === 'string' && cell.questionNumber.includes('-')) {
          console.log('🎯 Found range question:', cell.questionNumber);
          const [startNum, endNum] = cell.questionNumber.split('-').map(Number);

          for (let questionNumber = startNum; questionNumber <= endNum; questionNumber++) {
            if (transformedResults[questionNumber]) {
              console.log(`🎯 Keeping database data for question ${questionNumber}:`, transformedResults[questionNumber]);
            }
          }
        }
      });
    });
    
    console.log('🎯 Transformed backend data:', transformedResults);
    return transformedResults;
  };

  // Transform the backend data for rendering
  const transformedResults = transformBackendData(testResults?.results, template);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    if (onAnswerChange) {
      onAnswerChange(newAnswers);
    }
  };

  const getAnswerClass = (questionNumber) => {
    if (!testSubmitted) return '';
    
    try {
      // Convert to string and use base question number for marking (handles both "4" and "4_0" style keys)
      const questionNumberStr = String(questionNumber);
      const baseQuestionNumber = questionNumberStr.includes('_')
        ? questionNumberStr.split('_')[0]
        : questionNumberStr;
      
      // Also try numeric version in case results are keyed by numbers
      const baseQuestionNumberNum = Number(baseQuestionNumber);
      
      // First try transformedResults
      if (transformedResults) {
        const result = transformedResults[baseQuestionNumber] || transformedResults[baseQuestionNumberNum];
        console.log(`🎯 getAnswerClass for question ${baseQuestionNumber} (from ${questionNumber}):`, result);
        if (result && typeof result === 'object' && 'isCorrect' in result) {
          return result.isCorrect ? 'answer-correct' : 'answer-incorrect';
        }
      }
      
      // Fallback to testResults.results
      if (testResults?.results) {
        const fallbackResult = testResults.results[baseQuestionNumber] || testResults.results[baseQuestionNumberNum];
        if (fallbackResult && typeof fallbackResult === 'object' && 'isCorrect' in fallbackResult) {
          return fallbackResult.isCorrect ? 'answer-correct' : 'answer-incorrect';
        }
      }
    } catch (error) {
      console.error('❌ Error in getAnswerClass:', error, 'questionNumber:', questionNumber);
      return '';
    }
    
    return '';
  };

  const getAnswerValue = (questionNumberOrKey) => {
    try {
      // Convert to string to handle both numbers and strings safely
      const keyStr = String(questionNumberOrKey);
      
      // Handle input keys with suffixes (e.g., "4_0", "4_1") for multiple inputs in a cell
      // First, always check currentAnswers for the specific key (for active editing)
      if (currentAnswers) {
        if (currentAnswers[keyStr] !== undefined) {
          return currentAnswers[keyStr];
        }
        // Also check with original value in case it's stored as a number
        if (currentAnswers[questionNumberOrKey] !== undefined) {
          return currentAnswers[questionNumberOrKey];
        }
      }
      
      if (testSubmitted && testResults) {
        // After submission, check testResults.answers for the specific key
        // This handles cases where answers are stored with suffixes like "4_0", "4_1"
        if (testResults.answers) {
          if (testResults.answers[keyStr] !== undefined) {
            return testResults.answers[keyStr];
          }
          if (testResults.answers[questionNumberOrKey] !== undefined) {
            return testResults.answers[questionNumberOrKey];
          }

          const suffixMatch = keyStr.match(/^(\d+-\d+)_(\d+)$/);
          if (suffixMatch) {
            const [, range, indexStr] = suffixMatch;
            const [startNum] = range.split('-').map(Number);
            const markingKey = String(startNum + parseInt(indexStr, 10));
            if (testResults.answers[markingKey] !== undefined) {
              return testResults.answers[markingKey];
            }
          }
        }
        
        // Extract base question number if key has suffix (e.g., "4_0" -> "4")
        const baseQuestionNumber = keyStr.includes('_') 
          ? keyStr.split('_')[0] 
          : keyStr;
        const baseQuestionNumberNum = Number(baseQuestionNumber);
        
        // Try to get from transformedResults using base question number (for marking results)
        if (transformedResults) {
          const result = transformedResults[baseQuestionNumber] || transformedResults[baseQuestionNumberNum];
          if (result && typeof result === 'object' && result.userAnswer !== undefined) {
            // If the result has a userAnswer, it might be a combined answer
            // For multiple inputs, we need to check if the answer was stored with the suffix
            return result.userAnswer;
          }
        }
        
        // Try testResults.answers with base question number as fallback
        if (testResults.answers) {
          if (testResults.answers[baseQuestionNumber] !== undefined) {
            return testResults.answers[baseQuestionNumber];
          }
          if (testResults.answers[baseQuestionNumberNum] !== undefined) {
            return testResults.answers[baseQuestionNumberNum];
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in getAnswerValue:', error, 'questionNumberOrKey:', questionNumberOrKey);
      return '';
    }
    
    return '';
  };

  const getCorrectAnswerDisplay = (markingQuestionNumber) => {
    try {
      const questionNum = String(markingQuestionNumber);
      const questionNumAsNumber = Number(markingQuestionNumber);

      const correctAnswer =
        testResults?.correctAnswers?.[questionNum] ||
        testResults?.correctAnswers?.[questionNumAsNumber] ||
        testResults?.correctAnswers?.[markingQuestionNumber] ||
        transformedResults?.[questionNum]?.correctAnswer ||
        transformedResults?.[questionNumAsNumber]?.correctAnswer ||
        transformedResults?.[markingQuestionNumber]?.correctAnswer ||
        testResults?.results?.[questionNum]?.correctAnswer ||
        testResults?.results?.[questionNumAsNumber]?.correctAnswer ||
        testResults?.results?.[markingQuestionNumber]?.correctAnswer ||
        '';

      if (Array.isArray(correctAnswer)) {
        return correctAnswer.join(', ');
      }

      return String(correctAnswer || '');
    } catch (error) {
      console.error('❌ Error getting correct answer:', error, 'markingQuestionNumber:', markingQuestionNumber);
      return '';
    }
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
                          {processNewlines(stripMarkdownBold(cell.content)).split('________').map((part, partIndex, array) => {
                            const blankCount = array.length - 1;
                            const inputKey = getInputKey(cell.questionNumber, partIndex, blankCount);
                            const markingQuestionNumber = getMarkingQuestionNumber(cell.questionNumber, partIndex, blankCount);
                            
                            return (
                              <span key={partIndex}>
                                <span dangerouslySetInnerHTML={{ __html: part }} />
                                {partIndex < array.length - 1 && (
                                  <>
                                  <input
                                    type="text"
                                      className={`listening-table-answer-input ${getAnswerClass(markingQuestionNumber)}`}
                                    placeholder="Answer"
                                      value={getAnswerValue(inputKey)}
                                      onChange={(e) => handleAnswerChange(inputKey, e.target.value)}
                                    disabled={testSubmitted}
                                    autoComplete="off"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                  />
                                    {testSubmitted && testResults && (
                                      <span className="inline-correction">
                                        Correct: {getCorrectAnswerDisplay(markingQuestionNumber)}
                                      </span>
                                    )}
                                  </>
                                )}
                              </span>
                            );
                          })}
                          {/* Remove the cell-level feedback since we now show it inline */}
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
                          {processNewlines(stripMarkdownBold(cell.content)).split('________').map((part, partIndex, array) => {
                            const blankCount = array.length - 1;
                            const inputKey = getInputKey(cell.questionNumber, partIndex, blankCount);
                            const markingQuestionNumber = getMarkingQuestionNumber(cell.questionNumber, partIndex, blankCount);
                            
                            return (
                              <span key={partIndex}>
                                <span dangerouslySetInnerHTML={{ __html: part }} />
                                {partIndex < array.length - 1 && (
                                  <>
                                  <input
                                    type="text"
                                      className={`table-answer-input ${getAnswerClass(markingQuestionNumber)}`}
                                    placeholder="Answer"
                                      value={getAnswerValue(inputKey)}
                                      onChange={(e) => handleAnswerChange(inputKey, e.target.value)}
                                    disabled={testSubmitted}
                                    autoComplete="off"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                  />
                                    {testSubmitted && testResults && (
                                      <span className="inline-correction">
                                        Correct: {getCorrectAnswerDisplay(markingQuestionNumber)}
                                      </span>
                                    )}
                                  </>
                                )}
                              </span>
                            );
                          })}
                          {/* Remove the cell-level feedback since we now show it inline */}
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
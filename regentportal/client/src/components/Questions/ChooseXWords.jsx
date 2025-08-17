import React, { useState } from 'react';
import '../../styles/Questions/ChooseXWords.css';
import { processTextFormatting } from '../../utils/textFormatting';

const ChooseXWords = ({ template, onAnswerChange, testResults, testSubmitted, testType, componentId = 'choose-x-words', currentAnswers = {} }) => {
  console.log('🎯 ChooseXWords rendered with template:', template);
  console.log('🎯 ChooseXWords testResults:', testResults);
  console.log('🎯 ChooseXWords testSubmitted:', testSubmitted);
  console.log('🎯 ChooseXWords testSubmitted type:', typeof testSubmitted);
  console.log('🎯 ChooseXWords testSubmitted value:', testSubmitted);
  console.log('🎯 ChooseXWords currentAnswers prop:', currentAnswers);
  console.log('🎯 ChooseXWords onAnswerChange function:', typeof onAnswerChange);

  // Function to strip ** markers from text and convert to bold parentheses format
  const stripMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\*\*(\d+)\*\*/g, '<strong>($1)</strong>');
  };

  // Function to process bullet point tags and convert them to HTML
  const processBulletTags = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\[bullet\]/g, '<span class="bullet-point">•</span>');
  };

  // Function to process newline characters and convert them to HTML line breaks
  const processNewlines = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\n/g, '<br>');
  };

  // Function to add bullet points to text (excluding section headings)
  const addBulletPoints = (text, bulletLevel = 0, isSectionHeading = false) => {
    console.log(`🎯 addBulletPoints called with:`, { text, bulletLevel, isSectionHeading });
    if (!text || typeof text !== 'string') return '';
    if (isSectionHeading) return text; // Don't add bullets to section headings
    
    const bulletSymbols = {
      0: '•',    // Main bullet
      1: '◦',    // Sub bullet (hollow circle)
      2: '▪',    // Sub-sub bullet (square)
      3: '▫'     // Sub-sub-sub bullet (hollow square)
    };
    
    const indent = bulletLevel * 20; // 20px indent per level
    const symbol = bulletSymbols[bulletLevel] || '•';
    
    const result = `<span class="bullet-point" style="margin-left: ${indent}px">${symbol}</span> ${text}`;
    console.log(`🎯 addBulletPoints result:`, result);
    return result;
  };

  const handleAnswerChange = (questionNumber, value) => {
    console.log(`🎯 handleAnswerChange called with questionNumber: ${questionNumber}, value: ${value}`);
    console.log(`🎯 currentAnswers before update:`, currentAnswers);
    const newAnswers = { ...currentAnswers, [questionNumber]: value };
    console.log(`🎯 newAnswers after update:`, newAnswers);
    if (onAnswerChange) {
      console.log(`🎯 Calling onAnswerChange with:`, newAnswers);
      onAnswerChange(newAnswers);
    } else {
      console.log(`🎯 No onAnswerChange function provided`);
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

  if (!template || !template.questionBlock) {
    console.log('❌ ChooseXWords: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 ChooseXWords: Rendering', template.questionBlock.length, 'questions');
  console.log('🎯 ChooseXWords: testType =', testType);
  console.log('🎯 ChooseXWords: template =', template);

  // Check if this is the new structure (single text with blanks array)
  const isNewStructure = template.questionBlock[0] && template.questionBlock[0].text && template.questionBlock[0].blanks;

  // For Listening tests, render with Listening-specific styling
  if (testType === 'Listening' || testType === 'listening' || testType === 'LISTENING') {
    return (
      <div className="listening-notes-container" style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}>

        
        {/* Instructions - keep them visible like we made sure to do */}
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
        
        {template.notesTitle && (
          <h4 className="listening-notes-title" style={{
            margin: '0 0 20px 0',
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {template.notesTitle}
          </h4>
        )}
        
        <div className="listening-notes-content" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {template.questionBlock.map((item, index) => {
            if (item.sectionHeading) {
              return (
                <div key={index} className="listening-section-heading" style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#25245D',
                  margin: '15px 0 8px 0',
                  padding: '0',
                  fontWeight: '600'
                }}>
                  <strong>{item.sectionHeading}</strong>
                </div>
              );
            } else if (item.descriptiveText) {
              return (
                <div key={index} className="listening-descriptive-text" style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#333',
                  margin: '0',
                  padding: '0'
                }}>
                  <span dangerouslySetInnerHTML={{ 
                    __html: template.useBullets ? addBulletPoints(item.descriptiveText, item.bulletLevel || 0) : item.descriptiveText 
                  }} />
                </div>
              );
            } else if (item.text && item.blanks) {
              // New structure: single text with blanks array
              return (
                <div key={index} className="listening-question-item" style={{
                  padding: '0',
                  margin: '0'
                }}>
                  <div className="listening-question-text" style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: '#333',
                    margin: '0',
                    padding: '0',
                    display: 'block',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {processNewlines(processBulletTags(stripMarkdownBold(item.text || ''))).split('________').map((part, partIndex, array) => {
                      const blankNumber = item.blanks[partIndex]?.number;
                      console.log(`🎯 Rendering input for part ${partIndex}, blank number: ${blankNumber}`);
                      return (
                        <span key={partIndex}>
                          <span dangerouslySetInnerHTML={{ __html: part || '' }} />
                                                  {partIndex < array.length - 1 && (
                          <input
                            type="text"
                            className={`listening-answer-input ${getAnswerClass(blankNumber || '')}`}
                            style={{
                              border: '2px solid #ddd',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              fontSize: '0.9rem',
                              backgroundColor: 'white',
                              color: '#333',
                              transition: 'border-color 0.2s ease'
                            }}
                            placeholder="Answer"
                            value={getAnswerValue(blankNumber || '')}
                            onChange={(e) => {
                              console.log(`🎯 Input change event triggered for blank ${blankNumber}`);
                              console.log(`🎯 Input value: ${e.target.value}`);
                              console.log(`🎯 testSubmitted: ${testSubmitted}`);
                              handleAnswerChange(blankNumber || '', e.target.value);
                            }}
                            disabled={testSubmitted}
                            data-test-submitted={testSubmitted}
                            data-blank-number={blankNumber}
                            autoComplete="off"
                            data-form-type="other"
                            data-lpignore="true"
                            data-1p-ignore="true"
                          />
                        )}
                        </span>
                      );
                    })}
                  </div>
                  {testSubmitted && testResults && item.blanks && (
                    <div className="answer-feedback">
                      {item.blanks.map((blank, blankIndex) => (
                        <span key={blankIndex} className="correct-answer">
                          {blankIndex > 0 && ' | '}
                          {blank.number}: {String(testResults.correctAnswers?.[blank.number] || '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (item.questionNumber) {
              console.log(`🎯 Rendering old structure question ${item.questionNumber}:`, item.question);
              console.log(`🎯 Split parts:`, stripMarkdownBold(item.question).split('________'));
              return (
                <div key={index} className="listening-question-item" style={{
                  padding: '0',
                  margin: '0'
                }}>
                  <div className="listening-question-text" style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: '#333',
                    margin: '0',
                    padding: '0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {stripMarkdownBold(item.question).split('________').map((part, partIndex, array) => (
                      <span key={partIndex}>
                        <span dangerouslySetInnerHTML={{ 
                          __html: template.useBullets && partIndex === 0 ? addBulletPoints(part) : part 
                        }} />
                        {partIndex < array.length - 1 && (
                          <input
                            type="text"
                            className={`listening-answer-input ${getAnswerClass(item.questionNumber)}`}
                            style={{
                              border: '2px solid #ddd',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              fontSize: '0.9rem',
                              backgroundColor: 'white',
                              color: '#333',
                              transition: 'border-color 0.2s ease'
                            }}
                            placeholder="Answer"
                            value={getAnswerValue(item.questionNumber)}
                            onChange={(e) => {
                              console.log(`🎯 Old structure input change for question ${item.questionNumber}`);
                              console.log(`🎯 Input value: ${e.target.value}`);
                              console.log(`🎯 testSubmitted: ${testSubmitted}`);
                              handleAnswerChange(item.questionNumber, e.target.value);
                            }}
                            disabled={testSubmitted}
                            data-test-submitted={testSubmitted}
                            data-question-number={item.questionNumber}
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
                      <span className="correct-answer">
                        Correct: {String(testResults.correctAnswers?.[item.questionNumber] || '')}
                      </span>
                    </div>
                  )}
                </div>
              );
            }
            console.log(`🎯 Unhandled item type in listening section:`, item);
            return null;
          })}
        </div>
      </div>
    );
  }

  // For Reading tests, handle both old and new structures
  return (
    <div className={`choose-x-words-container ${testType === 'Reading' ? 'reading-test' : ''}`}>
      <div className="instructions">
        <h3 className="main-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.introInstruction) 
        }} />
        <p className="formatting-instruction" dangerouslySetInnerHTML={{ 
          __html: processTextFormatting(template.formattingInstruction) 
        }} />
      </div>
      
      <div className="notes-container">
        <div className="notes-content">
          {isNewStructure ? (
            // New structure: single text with blanks array
            template.questionBlock.map((block, blockIndex) => (
              <div key={blockIndex} className="question-item">
                <div className="question-text">
                  {processNewlines(processBulletTags(stripMarkdownBold(block.text || ''))).split('________').map((part, index, array) => (
                    <span key={index}>
                      <span dangerouslySetInnerHTML={{ __html: part || '' }} />
                      {index < array.length - 1 && (
                        <input
                          type="text"
                          className={`answer-input ${getAnswerClass(block.blanks[index]?.number || '')}`}
                          placeholder="Answer"
                          value={getAnswerValue(block.blanks[index]?.number || '')}
                          onChange={(e) => handleAnswerChange(block.blanks[index]?.number || '', e.target.value)}
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
                {testSubmitted && testResults && block.blanks && (
                  <div className="answer-feedback">
                    {block.blanks.map((blank, blankIndex) => (
                      <span key={blankIndex} className="correct-answer">
                        {blankIndex > 0 && ' | '}
                        {blank.number}: {String(testResults.correctAnswers?.[blank.number] || '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            // Old structure: individual questions
            template.questionBlock.map((item, index) => {
              if (item.sectionHeading) {
                return (
                  <div key={index} className="section-heading">
                    <strong>{item.sectionHeading}</strong>
                  </div>
                );
              } else if (item.descriptiveText) {
                return (
                  <div key={index} className="descriptive-text">
                    <span dangerouslySetInnerHTML={{ 
                      __html: template.useBullets ? addBulletPoints(item.descriptiveText, item.bulletLevel || 0) : item.descriptiveText 
                    }} />
                  </div>
                );
              } else if (item.questionNumber) {
                console.log(`🎯 Rendering question ${item.questionNumber}:`, item);
                console.log(`🎯 template.useBullets:`, template.useBullets);
                console.log(`🎯 item.bulletLevel:`, item.bulletLevel);
                return (
                  <div key={index} className="question-item">
                    <div className="question-text">
                      {stripMarkdownBold(item.question || '').split('________').map((part, partIndex, array) => (
                        <span key={partIndex}>
                          <span dangerouslySetInnerHTML={{ 
                            __html: template.useBullets && partIndex === 0 ? addBulletPoints(part, item.bulletLevel || 0) : part 
                          }} />
                          {partIndex < array.length - 1 && (
                            <input
                              type="text"
                              className={`answer-input ${getAnswerClass(item.questionNumber)}`}
                              placeholder="Answer"
                              value={getAnswerValue(item.questionNumber)}
                              onChange={(e) => handleAnswerChange(item.questionNumber, e.target.value)}
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
                        <span className="correct-answer">
                          Correct: {String(testResults.correctAnswers?.[item.questionNumber] || '')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChooseXWords;

import React, { useState } from 'react';
import '../../styles/Questions/ChooseXWords.css';
import { processTextFormatting } from '../../utils/textFormatting';

// Unified component for both student and teacher views
// Teacher view shows the same as student view after marking (testSubmitted=true with testResults)
// No teacher-specific logic - renders identically for both views
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
  const addBulletPoints = (text, bulletLevel = 0, isSectionHeading = false, isNumbered = false, numberedIndex = null) => {
    console.log(`🎯 addBulletPoints called with:`, { text, bulletLevel, isSectionHeading, isNumbered, numberedIndex });
    if (!text || typeof text !== 'string') return '';
    if (isSectionHeading) return text; // Don't add bullets to section headings
    
    // For numbered bullets, create numbered list
    if (isNumbered && numberedIndex !== null) {
      return `<span class="numbered-bullet">${numberedIndex}.</span> ${text}`;
    }
    
    // Default bullet behavior for other levels
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

  const isQuestionUnanswered = (questionNumber) => {
    if (!testSubmitted || !testResults) return false;
    
    const userAnswer = testResults.answers?.[questionNumber];
    return !userAnswer || userAnswer === '';
  };

  const getAnswerValue = (questionNumber) => {
    if (testSubmitted && testResults) {
      const userAnswer = testResults.answers?.[questionNumber];
      // If no answer was given, return empty string so we can show placeholder
      if (!userAnswer || userAnswer === '') {
        return '';
      }
      return userAnswer;
    }
    return currentAnswers[questionNumber] || '';
  };

  const getInputPlaceholder = (questionNumber) => {
    if (testSubmitted && testResults) {
      const userAnswer = testResults.answers?.[questionNumber];
      if (!userAnswer || userAnswer === '') {
        return 'No answer given';
      }
    }
    return 'Answer';
  };

  const normalizeQuestionNumber = (questionNumber) => {
    if (questionNumber == null) return '';
    return String(questionNumber);
  };

  if (!template || !template.questionBlock) {
    console.log('❌ ChooseXWords: No template or questionBlock');
    return <div>No questions available</div>;
  }

  console.log('🎯 ChooseXWords: Rendering', template.questionBlock.length, 'questions');
  console.log('🎯 ChooseXWords: testType =', testType);
  console.log('🎯 ChooseXWords: template =', template);

  // Check if this is the new structure (single text with blanks array)
  // Look for any item that has both text and blanks, not just the first item
  const isNewStructure = template.questionBlock.some(item => item.text && item.blanks);
  console.log(`🎯 ChooseXWords - isNewStructure:`, isNewStructure);
  console.log(`🎯 ChooseXWords - questionBlock items:`, template.questionBlock.map(item => ({
    hasSectionHeading: !!item.sectionHeading,
    hasText: !!item.text,
    hasBlanks: !!item.blanks,
    type: item.sectionHeading ? 'sectionHeading' : item.text && item.blanks ? 'question' : 'other'
  })));

  // Unified rendering for both Reading and Listening - use same structure and styling
  return (
    <div className={`choose-x-words-container ${testType === 'Reading' ? 'reading-test' : ''}`}>
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
      
      {/* Show notes title for both Reading and Listening */}
      {template.notesTitle && (
        <h4 className="reading-notes-title" style={{
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '1.3rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {template.notesTitle}
        </h4>
      )}
      
      <div className="notes-container">
        <div className="notes-content">
          {isNewStructure ? (
            // New structure: single text with blanks array (supports bullet points and descriptive text)
            template.questionBlock.map((block, blockIndex) => {
              console.log(`🎯 Unified - New structure - Block ${blockIndex}:`, block);
              console.log(`🎯 Unified - Block has sectionHeading:`, !!block.sectionHeading);
              console.log(`🎯 Unified - Block has descriptiveText:`, !!block.descriptiveText);
              console.log(`🎯 Unified - Block has text:`, !!block.text);
              console.log(`🎯 Unified - Block has blanks:`, !!block.blanks);
              
              // Check if this block is a section heading
              if (block.sectionHeading) {
                console.log(`🎯 Unified - Rendering section heading:`, block.sectionHeading);
                return (
                  <div key={blockIndex} className="section-heading">
                    <strong>{block.sectionHeading}</strong>
                  </div>
                );
              }
              
              // Check if this block is descriptive text
              if (block.descriptiveText) {
                console.log(`🎯 Unified - Rendering descriptive text:`, block.descriptiveText);
                return (
                  <div key={blockIndex} className="descriptive-text">
                    <span dangerouslySetInnerHTML={{ 
                      __html: (template.useBullets || block.numbered) ? addBulletPoints(block.descriptiveText, block.bulletLevel || 0, false, block.numbered || false, block.numberedIndex || null) : block.descriptiveText 
                    }} />
                  </div>
                );
              }
              
              // Otherwise render the question with blanks
              // Support both paragraph style (no bulletLevel) and bullet point style (with bulletLevel)
              console.log(`🎯 Unified - Rendering question with blanks`);
              // Add bullet if: useBullets is true and bulletLevel is defined, OR if numbered is true
              const hasBullet = (template.useBullets && block.bulletLevel !== undefined) || block.numbered;
              const bulletLevel = block.bulletLevel !== undefined ? block.bulletLevel : 0;
              const numberedIndex = block.numberedIndex || null;
              
              return (
                <div key={blockIndex} className="question-item">
                  <div className="question-text">
                    {processNewlines(processBulletTags(stripMarkdownBold(block.text || ''))).split('________').map((part, index, array) => {
                      // Get the blank for this position - use index to match split position
                      const blank = block.blanks && block.blanks[index] ? block.blanks[index] : null;
                      const blankNumber = blank?.number != null ? normalizeQuestionNumber(blank.number) : null;
                      const isFirstPart = index === 0;
                      const shouldAddBullet = hasBullet && isFirstPart;
                      
                      // Only render input if we have a valid blank number
                      const shouldRenderInput = index < array.length - 1 && blankNumber;
                      
                      console.log(`🎯 Rendering part ${index}, blank:`, blank, `blankNumber:`, blankNumber);
                      
                      // Use blankNumber in key to ensure unique React keys for each input
                      const uniqueKey = blankNumber ? `blank-${blankNumber}` : `part-${index}`;
                      
                      return (
                        <span key={uniqueKey}>
                          <span dangerouslySetInnerHTML={{ 
                            __html: shouldAddBullet 
                              ? addBulletPoints(part, bulletLevel, false, block.numbered || false, numberedIndex)
                              : part || '' 
                          }} />
                          {shouldRenderInput && blankNumber && (
                            <>
                              <input
                                key={`input-${blankNumber}`}
                                type="text"
                                className={`answer-input ${getAnswerClass(blankNumber)}`}
                                placeholder={getInputPlaceholder(blankNumber)}
                                value={getAnswerValue(blankNumber)}
                                onChange={(e) => {
                                  console.log(`🎯 Input onChange for blankNumber: ${blankNumber}, value: ${e.target.value}`);
                                  console.log(`🎯 Current answers before change:`, currentAnswers);
                                  handleAnswerChange(blankNumber, e.target.value);
                                }}
                                disabled={testSubmitted}
                                autoComplete="off"
                                data-form-type="other"
                                data-lpignore="true"
                                data-1p-ignore="true"
                                data-blank-number={blankNumber}
                                id={`answer-input-${blankNumber}`}
                              />
                              {/* Show inline correction after input field */}
                              {testSubmitted && testResults && (
                                <span className="inline-correction">
                                  Correct: {String(testResults.correctAnswers?.[blankNumber] || '')}
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // Old structure: individual questions
            (() => {
              // Track which question numbers have been rendered from range questions
              // to avoid rendering duplicates
              const renderedQuestionNumbers = new Set();
              
              return template.questionBlock.map((item, index) => {
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
                        __html: (template.useBullets || item.numbered) ? addBulletPoints(item.descriptiveText, item.bulletLevel || 0, false, item.numbered || false, item.numberedIndex || null) : item.descriptiveText 
                      }} />
                    </div>
                  );
                } else if (item.questionNumber != null) {
                  const questionNumberStr = normalizeQuestionNumber(item.questionNumber);

                  // Extract individual question numbers from the text for range questions
                  const extractQuestionNumbers = (text) => {
                    const matches = text.match(/\*\*(\d+)\*\*/g);
                    if (matches) {
                      return matches.map(match => match.replace(/\*\*/g, ''));
                    }
                    return [];
                  };
                  
                  const questionNumbers = extractQuestionNumbers(item.question || '');
                  const isRangeQuestion = questionNumberStr.includes('-') && questionNumbers.length > 0;
                  
                  // Check if this is a single question that's already covered by a range question
                  if (!isRangeQuestion && renderedQuestionNumbers.has(questionNumberStr)) {
                    console.log(`🎯 Skipping duplicate question ${questionNumberStr} - already rendered from range question`);
                    return null;
                  }
                  
                  // Mark question numbers as rendered
                  if (isRangeQuestion) {
                    questionNumbers.forEach(qNum => renderedQuestionNumbers.add(qNum));
                  } else {
                    renderedQuestionNumbers.add(questionNumberStr);
                  }
                  console.log(`🎯 Unified - Rendering question ${questionNumberStr}:`, item);
                  console.log(`🎯 Unified - template.useBullets:`, template.useBullets);
                  console.log(`🎯 Unified - item.bulletLevel:`, item.bulletLevel);
                  console.log(`🎯 Question numbers extracted:`, questionNumbers);
                  console.log(`🎯 Is range question:`, isRangeQuestion);
                
                  return (
                    <div key={index} className="question-item">
                      <div className="question-text">
                        {stripMarkdownBold(item.question || '').split('________').map((part, partIndex, array) => {
                          // For range questions, use the extracted question number for each blank
                          // For single questions, use the item.questionNumber
                          const questionNumberForThisInput = isRangeQuestion && questionNumbers[partIndex] 
                            ? questionNumbers[partIndex] 
                            : questionNumberStr;
                          
                          console.log(`🎯 Part ${partIndex}, questionNumberForThisInput:`, questionNumberForThisInput);
                          
                          return (
                            <span key={partIndex}>
                              <span dangerouslySetInnerHTML={{ 
                                __html: (template.useBullets || item.numbered) && partIndex === 0 ? addBulletPoints(part, item.bulletLevel || 0, false, item.numbered || false, item.numberedIndex || null) : part 
                              }} />
                              {partIndex < array.length - 1 && (
                                <>
                                  <input
                                    key={`input-${questionNumberForThisInput}-${partIndex}`}
                                    type="text"
                                    className={`answer-input ${getAnswerClass(questionNumberForThisInput)}`}
                                    placeholder={getInputPlaceholder(questionNumberForThisInput)}
                                    value={getAnswerValue(questionNumberForThisInput)}
                                    onChange={(e) => {
                                      console.log(`🎯 Old structure input onChange for questionNumber: ${questionNumberForThisInput}, value: ${e.target.value}`);
                                      handleAnswerChange(questionNumberForThisInput, e.target.value);
                                    }}
                                    disabled={testSubmitted}
                                    autoComplete="off"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    data-question-number={questionNumberForThisInput}
                                  />
                                  {/* Show inline correction after input field */}
                                  {testSubmitted && testResults && (
                                    <span className="inline-correction">
                                      Correct: {String(testResults.correctAnswers?.[questionNumberForThisInput] || '')}
                                    </span>
                                  )}
                                </>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              });
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default ChooseXWords;

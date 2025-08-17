import React, { useState, useEffect } from 'react';
import ChooseXWords from '../Questions/ChooseXWords';
import MultipleChoice from '../Questions/MultipleChoice';
import MultipleChoiceTwo from '../Questions/MultipleChoiceTwo';
import Matching from '../Questions/Matching';
import MapLabeling from '../Questions/MapLabeling';
import TableCompletion from '../Questions/TableCompletion';
import FlowchartCompletion from '../Questions/FlowchartCompletion';
import CompactAudioPlayer from './CompactAudioPlayer';

const ListeningQuestionView = ({ selectedTest, user, testResults: externalTestResults, testSubmitted: externalTestSubmitted, isTeacherMode = false, onBackToStudent = null }) => {
  console.log('🔍 ListeningQuestionView received user:', user);
  console.log('🔍 ListeningQuestionView received selectedTest:', selectedTest);
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPart, setCurrentPart] = useState(1);
  const [testStarted, setTestStarted] = useState(isTeacherMode);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  // Use external test results if provided (for teacher view)
  const finalTestResults = externalTestResults || testResults;
  const finalTestSubmitted = externalTestSubmitted || testSubmitted;

  // Load saved answers from localStorage on component mount
  useEffect(() => {
    if (selectedTest && selectedTest.testId) {
      const savedAnswers = localStorage.getItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`);
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          
          // Check if data is older than 4 hours
          const savedTimestamp = parsedAnswers._timestamp;
          const currentTime = Date.now();
          const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
          
          if (savedTimestamp && (currentTime - savedTimestamp) > fourHours) {
            // Data is older than 4 hours, clear it
            localStorage.removeItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`);
            console.log('📝 Cleared expired saved answers (older than 4 hours)');
            return;
          }
          
          setAnswers(parsedAnswers);
          console.log('📝 Loaded saved answers from localStorage:', parsedAnswers);
        } catch (error) {
          console.error('❌ Error parsing saved answers:', error);
        }
      }
    }
  }, [selectedTest]);

  // Add refresh confirmation warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testStarted && !testSubmitted && Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
        return '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testStarted, testSubmitted, answers]);



  const handleAnswerChange = (questionNumberOrNewAnswers, value) => {
    let newAnswers;
    
    // Check if this is the new signature (newAnswers object) or old signature (questionNumber, value)
    if (typeof questionNumberOrNewAnswers === 'object' && value === undefined) {
      // New signature: handleAnswerChange(newAnswers) - used by question components
      newAnswers = questionNumberOrNewAnswers;
      console.log('📝 Answer changed - New answers object:', newAnswers);
    } else {
      // Old signature: handleAnswerChange(questionNumber, value) - fallback
      const questionNumber = questionNumberOrNewAnswers;
      console.log('📝 Answer changed - Question:', questionNumber, 'Value:', value);
      console.log('📝 Previous answers:', answers);
      newAnswers = { ...answers, [questionNumber]: value };
    }
    
    setAnswers(newAnswers);
    
    // Save answers to localStorage with timestamp
    if (selectedTest && selectedTest.testId) {
      const answersWithTimestamp = {
        ...newAnswers,
        _timestamp: Date.now()
      };
      localStorage.setItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`, JSON.stringify(answersWithTimestamp));
      console.log('📝 Answers saved to localStorage with timestamp:', answersWithTimestamp);
    }
    
    console.log('📝 Answers updated:', newAnswers);
  };

  const handleStartTest = () => {
    setTestStarted(true);
    console.log('🚀 Test started');
  };

  const checkAnswers = (userAnswers, correctAnswers) => {
    let correctCount = 0;
    const totalQuestions = Object.keys(correctAnswers).length;
    const results = {};

    for (const questionNumber in correctAnswers) {
      const userAnswer = userAnswers[questionNumber];
      const correctAnswer = correctAnswers[questionNumber];
      let isCorrect = false;

      // Handle different answer types
      if (Array.isArray(correctAnswer)) {
        // Multiple choice with multiple answers (e.g., questions 21-24)
        if (Array.isArray(userAnswer)) {
          // Check if user answer is not empty and has correct length
          isCorrect = userAnswer.length > 0 && 
                     userAnswer.length === correctAnswer.length &&
                     userAnswer.every(answer => correctAnswer.includes(answer));
        } else {
          // User didn't provide an array answer
          isCorrect = false;
        }
      } else {
        // Single answer questions
        // Check if user answer is not empty and matches correct answer
        isCorrect = userAnswer && 
                   userAnswer.toString().trim() !== '' && 
                   userAnswer.toString().trim() === correctAnswer.toString().trim();
      }

      results[questionNumber] = {
        userAnswer: userAnswer || '',
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      };

      if (isCorrect) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

    return {
      score,
      totalQuestions,
      correctCount,
      results
    };
  };

  const handleSubmit = async () => {
    const confirmed = window.confirm('Are you sure you want to submit the test? You cannot change your answers after submission.');
    if (!confirmed) return;
    
    // Clear saved answers from localStorage after submission
    if (selectedTest && selectedTest.testId) {
      localStorage.removeItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`);
      console.log('📝 Cleared saved answers from localStorage after submission');
    }
    
    console.log('📝 Submitting test with answers:', answers);
    console.log('📝 User data:', user);
    
    try {
      const response = await fetch('/api/submit/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testId: selectedTest.testId._id,
          testType: selectedTest.type,
          answers: answers,
          studentId: user?._id || 'dummy-student-id'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Test submitted successfully:', result.data);
        console.log('📝 Server results structure:', result.data.results);
        
        // Set the test results from the backend response
        // Extract correct answers from the results
        const correctAnswers = {};
        Object.keys(result.data.results).forEach(questionNumber => {
          const resultItem = result.data.results[questionNumber];
          // Handle arrays (for multiple choice questions)
          if (Array.isArray(resultItem.correctAnswer)) {
            correctAnswers[questionNumber] = resultItem.correctAnswer.join(', ');
          } else {
            correctAnswers[questionNumber] = resultItem.correctAnswer;
          }
        });
        
        console.log('📝 Processed correct answers:', correctAnswers);
        
        setTestResults({
          score: result.data.score,
          totalQuestions: result.data.totalQuestions,
          correctCount: result.data.correctCount,
          answers: answers,
          correctAnswers: correctAnswers,
          results: result.data.results,
          submittedAt: result.data.submittedAt
        });
        setTestSubmitted(true);
        
        alert(`Test submitted successfully!\nYour score: ${result.data.score}%`);
      } else {
        throw new Error(result.message || 'Failed to submit test');
      }
    } catch (error) {
      console.error('❌ Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const handleResetTest = () => {
    const confirmed = window.confirm('Are you sure you want to reset the test? This will clear all your answers and return to the start.');
    if (!confirmed) return;
    
    setTestStarted(false);
    setTestSubmitted(false);
    setTestResults(null);
    setAnswers({});
    setCurrentPart(1);
    console.log('🔄 Test reset');
  };

  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!selectedTest) {
        console.log('❌ No selectedTest provided to ListeningQuestionView');
        setQuestionData(null);
        return;
      }

      console.log('🔍 ListeningQuestionView: Fetching questions for:', selectedTest);
      setLoading(true);
      setError(null);

      try {
        // Fetch question data for current part with test type
        const endpoint = `/api/tests/${selectedTest.testId._id}/questions/part${currentPart}?testType=${selectedTest.type}`;
        console.log('📡 Fetching from endpoint:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 Question data loaded:', data);
        console.log('📋 Question templates:', data.questionData?.templates);
        setQuestionData(data);
      } catch (error) {
        console.error('❌ Failed to fetch question data:', error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [selectedTest, currentPart]);

  const handlePartChange = (partNumber) => {
    setCurrentPart(partNumber);
    setQuestionData(null); // Clear current data when switching parts
  };

  console.log('🔍 ListeningQuestionView render state:', {
    selectedTest,
    audioSrc: selectedTest?.audioSrc,
    loading,
    error,
    questionData: questionData ? 'has data' : 'no data',
    currentPart,
    testSubmitted,
    testResults: testResults ? 'has results' : 'no results'
  });

  if (!selectedTest) {
    console.log('❌ No selectedTest - showing placeholder');
    return <div className="question-area-placeholder">Please select a test to view questions</div>;
  }

  // Safety check - if we have no question data and we're not loading, show error
  if (!questionData && !loading && selectedTest) {
    console.log('❌ No question data available and not loading');
    return (
      <div className="listening-question-view-container">
        <div className="error-message">
          <h3>No Questions Available</h3>
          <p>Unable to load questions for this test. Please try selecting a different test or refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('⏳ Loading questions...');
    return <div className="question-loading">Loading questions...</div>;
  }

  if (error) {
    console.log('❌ Error loading questions:', error);
    return <div className="question-error">Error: {error}</div>;
  }

  if (!questionData || !questionData.questionData) {
    console.log('❌ No question data available');
    return <div className="question-error">No question data available</div>;
  }

  // Render the appropriate question component based on the template type
  const renderQuestionComponent = () => {
    const { templates } = questionData.questionData;
    
    console.log('🎯 Rendering templates:', templates);
    
    if (!templates || templates.length === 0) {
      console.log('❌ No templates found');
      return <div>No question templates found</div>;
    }

        // All parts now use the same component system
    return templates.map((template, index) => {
      console.log('🎯 Rendering template:', template.questionType);
      
      const componentId = `part${currentPart}-${template.questionType}-${index}`;
      
      switch (template.questionType) {
        case 'choose-x-word':
          return (
            <ChooseXWords
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'multiple-choice':
          return (
            <MultipleChoice
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'multiple-choice-two':
          return (
            <MultipleChoiceTwo
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'matching':
          return (
            <Matching
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'map-labeling':
          return (
            <MapLabeling
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'table-completion':
          return (
            <TableCompletion
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'choose-two-letters':
          return (
            <MultipleChoiceTwo
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'flowchart-completion':
          return (
            <FlowchartCompletion
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        case 'notes-completion':
          return (
            <ChooseXWords
              key={componentId}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              testType={selectedTest.type}
              componentId={componentId}
              currentAnswers={answers}
            />
          );
        default:
          return (
            <div key={componentId} className="unsupported-question-type">
              Unsupported question type: {template.questionType}
            </div>
          );
      }
    });
  };


    
    return (
      <div className="listening-question-view-container">
        <div className="question-content">
          <div className="question-header">
            <div className="header-left">
              <div className="header-top-row">
                {selectedTest && selectedTest.audioSrc ? (
                  <CompactAudioPlayer 
                    audioSrc={selectedTest.audioSrc}
                    title="Listening Audio"
                  />
                ) : null}
                <h3>Questions</h3>
              </div>
            </div>
            <div className="part-toggle">
              <button 
                className={`part-button ${currentPart === 1 ? 'active' : ''}`}
                onClick={() => handlePartChange(1)}
                disabled={!testStarted}
              >
                Part 1
              </button>
              <button 
                className={`part-button ${currentPart === 2 ? 'active' : ''}`}
                onClick={() => handlePartChange(2)}
                disabled={!testStarted}
              >
                Part 2
              </button>
              <button 
                className={`part-button ${currentPart === 3 ? 'active' : ''}`}
                onClick={() => handlePartChange(3)}
                disabled={!testStarted}
              >
                Part 3
              </button>
              <button 
                className={`part-button ${currentPart === 4 ? 'active' : ''}`}
                onClick={() => handlePartChange(4)}
                disabled={!testStarted}
              >
                Part 4
              </button>
            </div>
          </div>
          

          
          {renderQuestionComponent()}
          
          {/* Submit button - Only show for students, not teachers */}
          {currentPart === 4 && testStarted && !isTeacherMode && (
            <div className="submit-section">
              <button 
                className={testSubmitted ? "reset-button" : "submit-button"}
                onClick={testSubmitted ? handleResetTest : handleSubmit}
              >
                {testSubmitted ? "Reset Test" : "Submit Test"}
              </button>
            </div>
          )}
          
          {/* Back to Student Info button - Only show for teachers */}
          {isTeacherMode && onBackToStudent && (
            <div className="submit-section">
              <button 
                className="back-to-student-button"
                onClick={onBackToStudent}
              >
                ← Back to Student Info
              </button>
            </div>
          )}
          
          {/* Score Display - Only show on Part 4 after submission */}
          {currentPart === 4 && finalTestSubmitted && finalTestResults && (
            <div className="score-display">
              <div className="score-card">
                <h3>Test Results</h3>
                <div className="score-details">
                  <div className="score-item">
                    <span className="score-label">Score:</span>
                    <span className="score-value">{finalTestResults.score}%</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Correct Answers:</span>
                    <span className="score-value">{finalTestResults.correctCount} / {finalTestResults.totalQuestions}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Submitted:</span>
                    <span className="score-value">
                      {new Date(finalTestResults.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Start Test Overlay - Only show for students, not teachers */}
        {!testStarted && !isTeacherMode && (
          <div className="test-overlay">
            <div className="overlay-content">
              <h2>Ready to Start?</h2>
              <p>You're about to begin the Listening Test. Make sure you're in a quiet environment and have your audio ready.</p>
              <button className="start-test-button" onClick={handleStartTest}>
                Start Test Now
              </button>
            </div>
          </div>
        )}
      </div>
    );

};

export default ListeningQuestionView; 
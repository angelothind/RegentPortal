import React, { useState, useEffect } from 'react';
import ChooseXWords from '../Questions/ChooseXWords';
import ChooseFrom from '../Questions/ChooseFrom';
import TFNG from '../Questions/TFNG';
import FlowchartCompletion from '../Questions/FlowchartCompletion';
import MapLabeling from '../Questions/MapLabeling';
import Matching from '../Questions/Matching';
import MultipleChoice from '../Questions/MultipleChoice';
import MultipleChoiceTwo from '../Questions/MultipleChoiceTwo';
import SummaryCompletion from '../Questions/SummaryCompletion';
import TableCompletion from '../Questions/TableCompletion';
import { calculateIELTSBand, formatBandScore, getBandScoreDescription } from '../../utils/bandScoreCalculator';

const QuestionView = ({ selectedTest, user, testResults: externalTestResults, testSubmitted: externalTestSubmitted, isTeacherMode = false, testStarted, onTestReset, sharedPassage, onPassageChange }) => {
  console.log('🚀 QuestionView component mounted with selectedTest:', selectedTest);
  console.log('🔍 QuestionView received user:', user);
  console.log('🔍 QuestionView received externalTestResults:', externalTestResults);
  console.log('🔍 QuestionView received externalTestSubmitted:', externalTestSubmitted);
  console.log('🔍 QuestionView received sharedPassage:', sharedPassage);
  
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(externalTestSubmitted || false);
  const [testResults, setTestResults] = useState(externalTestResults || null);

  // Debug currentPassage changes
  useEffect(() => {
    console.log('🔄 currentPassage state changed to:', sharedPassage);
  }, [sharedPassage]);

  // Load saved answers from localStorage on component mount (only for students, not teachers)
  useEffect(() => {
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Using external test results instead of localStorage');
      return;
    }

    console.log('🔄 Loading saved answers for test:', selectedTest);
    if (selectedTest && selectedTest.testId) {
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}`;
      console.log('🔍 Looking for answers in localStorage with key:', storageKey);
      
      const savedAnswers = localStorage.getItem(storageKey);
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          console.log('📝 Found saved answers:', parsedAnswers);
          
          // Check if data is older than 4 hours
          const savedTimestamp = parsedAnswers._timestamp;
          const currentTime = Date.now();
          const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
          
          if (savedTimestamp && (currentTime - savedTimestamp) > fourHours) {
            // Data is older than 4 hours, clear it
            localStorage.removeItem(storageKey);
            console.log('📝 Cleared expired saved answers (older than 4 hours)');
            return;
          }
          
          // Remove the timestamp from the answers object before setting state
          const { _timestamp, _currentPassage, _testSubmitted, _testResults, _testStarted, ...answersWithoutTimestamp } = parsedAnswers;
          setAnswers(answersWithoutTimestamp);
          
          // Restore the current passage if it was saved
          if (_currentPassage && typeof _currentPassage === 'number') {
            // setCurrentPassage(_currentPassage); // This line is removed as per the edit hint
            console.log('📝 Restored current passage from localStorage:', _currentPassage);
          }
          
          // Restore testSubmitted and testResults if they were saved
          if (_testSubmitted && _testResults) {
            setTestSubmitted(true);
            setTestResults(_testResults);
            console.log('📝 Restored testSubmitted and testResults from localStorage');
          }
          
          // Note: _testStarted is handled by the parent TestViewer component
          
          console.log('📝 Loaded saved answers from localStorage:', answersWithoutTimestamp);
        } catch (error) {
          console.error('❌ Error parsing saved answers:', error);
        }
      } else {
        console.log('📝 No saved answers found in localStorage');
      }
    }
  }, [selectedTest, isTeacherMode]);

  // Reload answers from localStorage when passage changes (only for students, not teachers)
  useEffect(() => {
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Skipping localStorage operations for passage changes');
      return;
    }

    // Only reload answers if we have a selectedTest (to avoid running on initial mount)
    if (selectedTest && selectedTest.testId && Object.keys(answers).length > 0) {
      console.log('🔄 Passage changed to:', sharedPassage, '- reloading answers from localStorage');
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}`;
      const savedAnswers = localStorage.getItem(storageKey);
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          const { _timestamp, _currentPassage, _testSubmitted, _testResults, _testStarted, ...answersWithoutTimestamp } = parsedAnswers;
          setAnswers(answersWithoutTimestamp);
          console.log('📝 Reloaded answers from localStorage after passage change:', answersWithoutTimestamp);
        } catch (error) {
          console.error('❌ Error parsing saved answers after passage change:', error);
        }
      }
    }
  }, [sharedPassage, selectedTest, isTeacherMode, answers]);

  // Add refresh confirmation warning (only for students, not teachers)
  useEffect(() => {
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Skipping refresh confirmation warning');
      return;
    }

    const handleBeforeUnload = (e) => {
      if (!testSubmitted && Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
        return '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testSubmitted, answers, isTeacherMode]);

  // Fetch question data when passage changes
  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!selectedTest) {
        console.log('❌ No selectedTest provided to QuestionView');
        setQuestionData(null);
        return;
      }

      console.log('🔍 QuestionView: Fetching questions for passage:', sharedPassage);
      setLoading(true);
      setError(null);

      try {
        // Fetch question data for current passage with test type
        const endpoint = `/api/tests/${selectedTest.testId._id}/questions/part${sharedPassage}?testType=${selectedTest.type}`;
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
  }, [selectedTest, sharedPassage]);

  const handleAnswerChange = (questionNumberOrNewAnswers, value) => {
    // In teacher mode, don't allow answer changes
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Answer changes not allowed');
      return;
    }

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
    
    console.log('📝 New answers object:', newAnswers);
    
    // Save answers to localStorage with timestamp
    if (selectedTest && selectedTest.testId) {
      const answersWithTimestamp = {
        ...newAnswers,
        _timestamp: Date.now(),
        _currentPassage: sharedPassage,
        _testSubmitted: testSubmitted,
        _testStarted: true,
        _testResults: testResults
      };
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}`;
      localStorage.setItem(storageKey, JSON.stringify(answersWithTimestamp));
      console.log('📝 Answers and test state saved to localStorage with key:', storageKey);
      console.log('📝 Saved data:', answersWithTimestamp);
    }
    
    console.log('📝 Answers updated:', newAnswers);
  };



  const handleSubmit = async () => {
    // In teacher mode, don't allow test submission
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Test submission not allowed');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to submit the test? You cannot change your answers after submission.');
    if (!confirmed) return;
    
    // Clear saved answers from localStorage after submission
    if (selectedTest && selectedTest.testId) {
      localStorage.removeItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`);
      console.log('📝 Cleared saved answers from localStorage after submission');
    }
    
    console.log('📝 Submitting test with answers:', answers);
    console.log('📝 User data:', user);
    console.log('📝 Selected test before submission:', selectedTest);
    
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
        console.log('📝 Selected test after submission:', selectedTest);
        
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
        
        // Save the submitted answers and current passage state to localStorage
        if (selectedTest && selectedTest.testId) {
          const answersWithTimestamp = {
            ...answers,
            _timestamp: Date.now(),
            _currentPassage: sharedPassage,
            _testSubmitted: true,
            _testStarted: true,
            _testResults: {
              score: result.data.score,
              totalQuestions: result.data.totalQuestions,
              correctCount: result.data.correctCount,
              answers: answers,
              correctAnswers: correctAnswers,
              results: result.data.results,
              submittedAt: result.data.submittedAt
            }
          };
          const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}`;
          localStorage.setItem(storageKey, JSON.stringify(answersWithTimestamp));
          console.log('📝 Saved submitted answers, passage state, test results, and testStarted to localStorage:', answersWithTimestamp);
        }
        
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
    // In teacher mode, don't allow test reset
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Test reset not allowed');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to reset the test? This will clear all your answers and return to the start.');
    if (!confirmed) return;
    
    setTestSubmitted(false);
    setTestResults(null);
    setAnswers({});
    
    // Clear localStorage for this test
    if (selectedTest && selectedTest.testId) {
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}`;
      localStorage.removeItem(storageKey);
      console.log('🧹 Cleared localStorage for test reset:', storageKey);
    }
    
    // Call the parent's reset callback
    if (onTestReset) {
      onTestReset();
    }
    
    console.log('🔄 Test reset');
  };

  console.log('🔍 QuestionView render state:', {
    selectedTest,
    loading,
    error,
    questionData: questionData ? 'has data' : 'no data'
  });

  if (!selectedTest) {
    console.log('❌ No selectedTest - showing placeholder');
    return <div className="question-area-placeholder">Please select a test to view questions</div>;
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

    return templates.map((template, index) => {
      console.log('🎯 Rendering template:', template.questionType);
      
      switch (template.questionType) {
        case 'choose-x-word':
          return (
            <ChooseXWords
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testType={selectedTest.type}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'choose-from':
          return (
            <ChooseFrom
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testType={selectedTest.type}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'TFNG':
          return (
            <TFNG
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'ysng':
          return (
            <TFNG
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'matching':
          return (
            <Matching
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'multiple-choice':
          return (
            <MultipleChoice
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'multiple-choice-two':
          return (
            <MultipleChoiceTwo
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
              testType={selectedTest.type}
            />
          );
        case 'summary-completion':
          return (
            <SummaryCompletion
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'table-completion':
          return (
            <TableCompletion
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'notes-completion':
          return (
            <ChooseXWords
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'flowchart-completion':
          return (
            <FlowchartCompletion
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        case 'choose-two-letters':
          return (
            <MultipleChoiceTwo
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
              testType={selectedTest.type}
            />
          );
        case 'map-labeling':
          return (
            <MapLabeling
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={testResults}
              testSubmitted={testSubmitted}
              currentAnswers={answers}
            />
          );
        // TODO: Add other question types here
        default:
          return (
            <div key={index} className="unsupported-question-type">
              Unsupported question type: {template.questionType}
            </div>
          );
      }
    });
  };

  return (
    <div className="question-view-container">
      <div className="question-header">
        <div className="header-left">
          <h3>Questions</h3>
        </div>
        <div className="passage-toggle">
          <button 
            className={`passage-button ${sharedPassage === 1 ? 'active' : ''}`}
            onClick={() => onPassageChange(1)}
          >
            Passage 1
          </button>
          <button 
            className={`passage-button ${sharedPassage === 2 ? 'active' : ''}`}
            onClick={() => onPassageChange(2)}
          >
            Passage 2
          </button>
          <button 
            className={`passage-button ${sharedPassage === 3 ? 'active' : ''}`}
            onClick={() => onPassageChange(3)}
          >
            Passage 3
          </button>
        </div>
      </div>
      
      <div className="question-content">
        {renderQuestionComponent()}
      </div>
      
      {/* Test Controls - Submit only on last passage, reset only after submission (not shown in teacher mode) */}
      {!isTeacherMode && sharedPassage === 3 && !testSubmitted && (
        <div className="test-controls">
          <div className="submit-section">
            <button className="submit-button" onClick={handleSubmit}>
              Submit Test
            </button>
          </div>
        </div>
      )}
      
      {/* Results section - only show after submission on last passage (not shown in teacher mode) */}
      {!isTeacherMode && testSubmitted && sharedPassage === 3 && (
        <div className="test-controls">
          <div className="results-section">
            <h3>Test Results</h3>
            <div className="score-details compact">
              <div className="score-item">
                <span className="score-label">Score:</span>
                <span className="score-value">{testResults?.score}%</span>
              </div>
              <div className="score-item">
                <span className="score-label">Correct:</span>
                <span className="score-value">{testResults?.correctCount} / {testResults?.totalQuestions}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Band:</span>
                <span className="score-value">
                  {formatBandScore(calculateIELTSBand(testResults?.correctCount, selectedTest?.type))}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Level:</span>
                <span className="score-value">
                  {getBandScoreDescription(calculateIELTSBand(testResults?.correctCount, selectedTest?.type))}
                </span>
              </div>
            </div>
            <button className="reset-button" onClick={handleResetTest}>
              Take Test Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionView; 
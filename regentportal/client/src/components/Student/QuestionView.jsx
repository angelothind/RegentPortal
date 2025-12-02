import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import API_BASE from '../../utils/api';

const QuestionView = ({ selectedTest, user, testResults: externalTestResults, testSubmitted: externalTestSubmitted, isTeacherMode = false, onTestReset, sharedPassage, onPassageChange, testData }) => {
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
  const [testStarted, setTestStarted] = useState(isTeacherMode); // Add testStarted state like ListeningQuestionView
  const [currentPassage, setCurrentPassage] = useState(sharedPassage || 1); // Track current passage
  const abortControllerRef = useRef(null); // Track abort controller for request cancellation
  const expectedPassageRef = useRef(null); // Track which passage we're currently fetching for
  const activePassageRef = useRef(sharedPassage || 1); // Track the active passage that should be displayed
  const fetchRequestIdRef = useRef(0); // Track unique request IDs to ensure we only accept the latest fetch
  
  // Use external test results if provided (for teacher view) - same pattern as ListeningQuestionView
  const finalTestResults = externalTestResults || testResults;
  const finalTestSubmitted = externalTestSubmitted || testSubmitted;

  // Debug currentPassage changes
  useEffect(() => {
    console.log('🔄 currentPassage state changed to:', currentPassage);
  }, [currentPassage]);

  // Update currentPassage when sharedPassage prop changes
  useEffect(() => {
    if (sharedPassage && sharedPassage !== currentPassage) {
      console.log('🔄 QuestionView: Updating currentPassage from prop:', sharedPassage);
      // Update active passage ref immediately
      activePassageRef.current = sharedPassage;
      // Cancel any in-flight requests when passage changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Clear expected passage ref to invalidate any in-flight requests
      expectedPassageRef.current = null;
      // Clear question data immediately to prevent showing stale content
      setQuestionData(null);
      setCurrentPassage(sharedPassage);
    }
  }, [sharedPassage, currentPassage]);

  // Keep activePassageRef in sync with sharedPassage
  useEffect(() => {
    if (sharedPassage) {
      activePassageRef.current = sharedPassage;
    }
  }, [sharedPassage]);

  // Cleanup: Cancel any in-flight requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Wrap fetchQuestionData in useCallback to prevent infinite re-renders
  const fetchQuestionData = useCallback(async (passageNumber = null) => {
    if (!selectedTest) {
      console.log('❌ No selectedTest provided to QuestionView');
      setQuestionData(null);
      return;
    }

    // Cancel any previous in-flight request to prevent race conditions
    if (abortControllerRef.current) {
      console.log('🛑 Cancelling previous fetch request');
      abortControllerRef.current.abort();
    }

    // In teacher mode, prefer sharedPassage prop; otherwise use currentPassage state
    // This prevents race conditions where state hasn't updated yet
    const passageToFetch = passageNumber || (isTeacherMode && sharedPassage ? sharedPassage : currentPassage);
    
    // Store the expected passage for this fetch to validate later
    expectedPassageRef.current = passageToFetch;
    // Generate unique request ID for this fetch
    const requestId = ++fetchRequestIdRef.current;
    
    console.log('🔍 QuestionView: Fetching questions for passage:', passageToFetch, 'Request ID:', requestId);
    console.log('🔍 QuestionView: Using passage from:', {
      passageNumber,
      isTeacherMode,
      sharedPassage,
      currentPassage,
      finalPassage: passageToFetch
    });
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    // Clear old data immediately to prevent showing stale content
    setQuestionData(null);

    try {
      // Fetch question data for current passage with test type
      const endpoint = `${API_BASE}/api/tests/${selectedTest.testId._id}/questions/part${passageToFetch}?testType=${selectedTest.type}`;
      console.log('📡 Fetching from endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        signal: abortController.signal
      });
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log('🛑 Request was aborted, ignoring response');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // CRITICAL: Validate this data is still for the correct passage before setting it
      // Check multiple sources to ensure we're not showing stale data
      const fetchStartedFor = expectedPassageRef.current;
      const currentActivePassage = activePassageRef.current;
      const currentExpectedPassage = isTeacherMode && sharedPassage ? sharedPassage : currentPassage;
      const currentRequestId = fetchRequestIdRef.current;
      
      // Check 1: Ensure this is still the latest request (not a stale one)
      if (requestId !== currentRequestId) {
        console.log('⚠️ This is not the latest request, discarding. Request ID:', requestId, 'Current:', currentRequestId);
        return;
      }
      
      // Check 2: If ANY of these don't match passageToFetch, discard this data (it's stale)
      // This triple-check ensures we catch race conditions even in production builds
      if (fetchStartedFor !== passageToFetch || 
          currentActivePassage !== passageToFetch || 
          currentExpectedPassage !== passageToFetch) {
        console.log('⚠️ Passage changed during fetch, discarding stale data.', {
          fetchStartedFor,
          passageToFetch,
          currentActivePassage,
          currentExpectedPassage,
          isTeacherMode,
          sharedPassage,
          currentPassage,
          requestId
        });
        return;
      }
      
      // Check 3: Ensure abort signal wasn't triggered (double-check)
      if (abortController.signal.aborted) {
        console.log('🛑 Request was aborted (final check), ignoring response');
        return;
      }
      
      console.log('📋 Question data loaded for passage:', passageToFetch, 'Request ID:', requestId);
      console.log('📋 Question templates:', data.questionData?.templates);
      setQuestionData(data);
      setLoading(false);
    } catch (error) {
      // Ignore abort errors (they're expected when cancelling)
      if (error.name === 'AbortError') {
        console.log('🛑 Fetch was aborted (expected when toggling quickly)');
        // Don't update loading state - new request will handle it
        return;
      }
      console.error('❌ Failed to fetch question data:', error);
      setError('Failed to load questions');
      setLoading(false);
    }
  }, [selectedTest, currentPassage, isTeacherMode, sharedPassage]);

  // In teacher mode, fetch questions when testData becomes available or when sharedPassage changes
  useEffect(() => {
    if (isTeacherMode && testData && sharedPassage) {
      console.log('👨‍🏫 Teacher mode: Fetching question data for passage:', sharedPassage);
      // Use sharedPassage directly to avoid race conditions
      fetchQuestionData(sharedPassage);
    }
  }, [isTeacherMode, testData, sharedPassage, fetchQuestionData]);

  // In student mode, fetch question data when passage changes
  useEffect(() => {
    if (!isTeacherMode && selectedTest && currentPassage) {
      console.log('👨‍🎓 Student mode: Fetching question data for passage:', currentPassage);
      fetchQuestionData(currentPassage);
    }
  }, [selectedTest, currentPassage, isTeacherMode, fetchQuestionData]);

  // Load saved answers from localStorage on component mount (only for students, not teachers)
  useEffect(() => {
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Using external test results instead of localStorage');
      return;
    }

    console.log('🔄 Loading saved answers for test:', selectedTest);
    if (selectedTest && selectedTest.testId) {
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
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
          
          // Restore testStarted if it was saved AND there are actual answers
          // If no answers, don't restore testStarted (so overlay can show)
          if (_testStarted && Object.keys(answersWithoutTimestamp).length > 0) {
            setTestStarted(true);
            console.log('📝 Restored testStarted from localStorage (has answers)');
          } else if (_testStarted && Object.keys(answersWithoutTimestamp).length === 0) {
            // If test was started but no answers, reset to show overlay
            setTestStarted(false);
            console.log('📝 Reset testStarted to false (no answers, overlay should show)');
          }
          
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
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
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
        console.log('⚠️ Beforeunload triggered - preventing navigation due to unsaved answers');
        console.log('📝 Current answers:', answers);
        console.log('📝 Test submitted:', testSubmitted);
        e.preventDefault();
        e.returnValue = '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
        return '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
      } else {
        console.log('✅ Beforeunload triggered - allowing navigation (no unsaved answers)');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testSubmitted, answers, isTeacherMode]);

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
        _currentPassage: currentPassage,
        _testSubmitted: testSubmitted,
        _testStarted: testStarted,
        _testResults: testResults
      };
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
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

    // Validate user data before submission
    if (!user || !user._id) {
      console.error('❌ No valid user data available for submission');
      alert('Error: User session not found. Please log in again.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to submit the test? You cannot change your answers after submission.');
    if (!confirmed) return;
    
    // Clear saved answers from localStorage after submission
    if (selectedTest && selectedTest.testId) {
      localStorage.removeItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`);
      console.log('📝 Cleared saved answers from localStorage after submission');
    }
    
    console.log('📝 Submitting test with answers:', answers);
    console.log('📝 User data:', user);
    console.log('📝 Selected test before submission:', selectedTest);
    
    try {
      const response = await fetch(`${API_BASE}/api/submit/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testId: selectedTest.testId._id,
          testType: selectedTest.type,
          answers: answers,
          studentId: user._id
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
            _currentPassage: currentPassage,
            _testSubmitted: true,
            _testStarted: testStarted,
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
          const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
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

  const handleStartTest = () => {
    console.log('🚀 Starting test...');
    setTestStarted(true);
    console.log('✅ Test started');
  };

  const handleResetTest = () => {
    // In teacher mode, don't allow test reset
    if (isTeacherMode) {
      console.log('👨‍🏫 Teacher mode: Test reset not allowed');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to reset the test? This will clear all your answers and return to the start.');
    if (!confirmed) return;
    
    console.log('🔄 Starting test reset...');
    console.log('🔄 Before reset - testStarted:', testStarted, 'testSubmitted:', testSubmitted);
    
    // Clear all state
    setTestSubmitted(false);
    setTestResults(null);
    setTestStarted(false); // Reset testStarted to show start overlay again
    setAnswers({});
    
    // Reset passage back to 1
    if (onPassageChange) {
      onPassageChange(1);
      console.log('🔄 Reset passage back to 1');
    }
    
    // Clear localStorage for this test
    if (selectedTest && selectedTest.testId) {
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
      localStorage.removeItem(storageKey);
      console.log('🧹 Cleared localStorage for test reset:', storageKey);
      
      // Double-check localStorage is cleared
      const checkStorage = localStorage.getItem(storageKey);
      console.log('🧹 localStorage check after clear:', checkStorage ? 'STILL EXISTS' : 'CLEARED');
    }
    
    // Call the parent's reset callback
    if (onTestReset) {
      onTestReset();
    }
    
    console.log('🔄 After reset - testStarted:', false, 'testSubmitted:', false);
    console.log('✅ Test reset complete - start overlay should now be visible');
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
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
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
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'TFNG':
          return (
            <TFNG
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'ysng':
          return (
            <TFNG
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'matching':
          return (
            <Matching
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'multiple-choice':
          return (
            <MultipleChoice
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'multiple-choice-two':
          return (
            <MultipleChoiceTwo
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
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
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'table-completion':
          return (
            <TableCompletion
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'notes-completion':
                  return (
          <ChooseXWords
            key={index}
            template={template}
            onAnswerChange={handleAnswerChange}
            testResults={finalTestResults}
            testSubmitted={finalTestSubmitted}
            currentAnswers={answers}
          />
        );
        case 'flowchart-completion':
          return (
            <FlowchartCompletion
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
              currentAnswers={answers}
            />
          );
        case 'choose-two-letters':
          return (
            <MultipleChoiceTwo
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
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
              testResults={finalTestResults}
              testSubmitted={finalTestSubmitted}
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
          {/* Limit to exactly 3 passages for reading tests */}
          {[1, 2, 3].map((passageNumber) => (
          <button 
              key={passageNumber}
              className={`passage-button ${currentPassage === passageNumber ? 'active' : ''}`}
              onClick={() => onPassageChange(passageNumber)}
          >
              Passage {passageNumber}
          </button>
          ))}
        </div>
      </div>
      
      <div className="question-content">
        {renderQuestionComponent()}
      </div>
      
      {/* Test Controls - Submit only on last passage, reset only after submission (not shown in teacher mode) */}
      {!isTeacherMode && currentPassage === 3 && !finalTestSubmitted && (
        <div className="test-controls">
          <div className="submit-section">
            <button className="submit-button" onClick={handleSubmit}>
              Submit Test
            </button>
          </div>
        </div>
      )}
      
      {/* Results section - show after submission on last passage for both students and teachers */}
      {finalTestSubmitted && currentPassage === 3 && finalTestResults && (
        <div className="test-controls">
          <div className="results-section">
            <h3>Test Results</h3>
            <div className="score-details compact">
              <div className="score-item">
                <span className="score-label">Score:</span>
                <span className="score-value">{finalTestResults.score}%</span>
              </div>
              <div className="score-item">
                <span className="score-label">Correct:</span>
                <span className="score-value">{finalTestResults.correctCount} / {finalTestResults.totalQuestions}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Band:</span>
                <span className="score-value">
                  {formatBandScore(calculateIELTSBand(finalTestResults.correctCount, selectedTest?.type))}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Level:</span>
                <span className="score-value">
                  {getBandScoreDescription(calculateIELTSBand(finalTestResults.correctCount, selectedTest?.type))}
                </span>
              </div>
            </div>
            {!isTeacherMode && (
            <button className="reset-button" onClick={handleResetTest}>
              Take Test Again
            </button>
            )}
          </div>
        </div>
      )}
      
      {/* Start Test Overlay - Only show for students, not teachers */}
      {!testStarted && !isTeacherMode && (
        <div className="test-overlay">
          <div className="overlay-content">
            <h2>Ready to Start?</h2>
            <p>You're about to begin the Reading Test. Make sure you're in a quiet environment and ready to focus.</p>
            <button className="start-test-button" onClick={handleStartTest}>
              Start Test Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionView; 
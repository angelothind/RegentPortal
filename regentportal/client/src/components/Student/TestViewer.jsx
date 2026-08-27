import React, { useState, useEffect } from 'react';
import ReadingTest from './ReadingTest';
import QuestionView from './QuestionView';
import ListeningQuestionView from './ListeningQuestionView';
import DraggableDivider from './DraggableDivider';
import { HighlightProvider } from '../../contexts/HighlightContext';
import API_BASE from '../../utils/api';
import { isSessionExpired } from '../../utils/testSessionUtils';

const TestViewer = ({ selectedTest, user }) => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passageWidth, setPassageWidth] = useState(56);
  const [questionWidth, setQuestionWidth] = useState(44);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const [sharedPassage, setSharedPassage] = useState(1);

  // Load test state from localStorage when selectedTest changes
  useEffect(() => {
    // Reset testStarted and passage when a new test is selected
    setTestStarted(false);
    setSharedPassage(1);
    console.log('🔄 TestViewer: Reset testStarted to false and passage to 1 for new test');
    
    if (selectedTest && selectedTest.testId) {
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (isSessionExpired(parsedData._timestamp)) {
            localStorage.removeItem(storageKey);
            return;
          }
          if (parsedData._testStarted) {
            setTestStarted(true);
            console.log('📝 Restored testStarted state from localStorage');
          }
        } catch (error) {
          console.error('❌ Error parsing saved test state:', error);
        }
      }
    }
  }, [selectedTest, user?._id]);

  const handleStartTest = () => {
    setTestStarted(true);
    console.log('🚀 Test started - testStarted set to true');
    
    // Save test state to localStorage
    if (selectedTest && selectedTest.testId) {
      const storageKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
      const existingData = localStorage.getItem(storageKey);
      let savedData = {};
      
      if (existingData) {
        try {
          savedData = JSON.parse(existingData);
        } catch (error) {
          console.error('❌ Error parsing existing saved data:', error);
        }
      }
      
      const updatedData = {
        ...savedData,
        _testStarted: true,
        _timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      console.log('📝 Saved testStarted state to localStorage');
    }
  };

  const handleTestReset = () => {
    setTestStarted(false);
    setTestSubmitted(false);
    setTestResults(null);
    setSharedPassage(1);
    console.log('🔄 Test reset - testStarted set to false, passage reset to 1');
  };

  const handleSubmit = async () => {
    const confirmed = window.confirm('Are you sure you want to submit the test? You cannot change your answers after submission.');
    if (!confirmed) return;
    
    try {
      setTestSubmitted(true);
      // For now, just mark as submitted. In a real implementation, you'd send data to server
      console.log('📝 Test submitted');
    } catch (error) {
      console.error('❌ Error submitting test:', error);
      setTestSubmitted(false);
    }
  };

  // Monitor testStarted state changes
  useEffect(() => {
    console.log('🔄 TestViewer: testStarted state changed to:', testStarted);
  }, [testStarted]);

  const handlePassageChange = (passageNumber) => {
    console.log('🔄 TestViewer: Passage changed to:', passageNumber);
    setSharedPassage(passageNumber);
  };

  useEffect(() => {
    const fetchTestData = async () => {
      if (!selectedTest) {
        console.log('❌ TestViewer: No selectedTest provided');
        setTestData(null);
        return;
      }

      console.log('🔍 TestViewer: Fetching test data for:', selectedTest);
      console.log('🔍 TestViewer: selectedTest.testId:', selectedTest.testId);
      console.log('🔍 TestViewer: selectedTest.testId._id:', selectedTest.testId?._id);
      console.log('🔍 TestViewer: selectedTest.type:', selectedTest.type);
      
      setLoading(true);
      try {
        // 🔒 SECURE: Use specific endpoints based on test type from sidebar selection
        let endpoint;
        if (selectedTest.type === 'Reading') {
          endpoint = `${API_BASE}/api/tests/${selectedTest.testId._id}/reading`;
        } else if (selectedTest.type === 'Listening') {
          endpoint = `${API_BASE}/api/tests/${selectedTest.testId._id}/listening`;
        } else {
          // Fallback to generic endpoint with test type parameter
          endpoint = `${API_BASE}/api/tests/${selectedTest.testId._id}?testType=${selectedTest.type}`;
        }

        console.log('📡 TestViewer: Calling endpoint:', endpoint);
        const res = await fetch(endpoint);
        console.log('📡 TestViewer: Response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ TestViewer: HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
        }
        
        const data = await res.json();
        console.log('📋 TestViewer: Received test data:', data);
        
        // Backend now sends only the appropriate sources, no need to filter on frontend
        setTestData(data);
      } catch (error) {
        console.error('❌ Failed to fetch test data:', error);
        console.error('❌ Error details:', error.message);
        setTestData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [selectedTest]);

  if (!selectedTest) {
    console.log('❌ TestViewer: No selectedTest');
    return <div className="main-content">Please select a test</div>;
  }
  if (loading) {
    console.log('⏳ TestViewer: Loading...');
    return <div className="main-content">Loading test data...</div>;
  }
  if (!testData) {
    console.log('❌ TestViewer: No testData available');
    return <div className="main-content">No test data available</div>;
  }

  console.log('🎯 TestViewer render - selectedTest:', selectedTest);
  console.log('🎯 TestViewer render - selectedTest.type:', selectedTest?.type);
  console.log('🎯 TestViewer render - testData:', testData);
  console.log('🎯 TestViewer render - testData.sources:', testData?.sources);
  
  const handleResize = (newPassageWidth, newQuestionWidth) => {
    setPassageWidth(newPassageWidth);
    setQuestionWidth(newQuestionWidth);
  };

  return (
    <>
      {selectedTest.type === 'Reading' && (
        <HighlightProvider
          testId={selectedTest.testId._id}
          testType={selectedTest.type}
          userId={user?._id}
          persist={Boolean(user?._id)}
        >
          <div className="test-viewer-container">
            <div 
              className="test-content-area"
              style={{ width: `${passageWidth}%` }}
            >
              <ReadingTest 
                testId={selectedTest.testId} 
                testData={testData} 
                onPassageChange={handlePassageChange}
                currentPassage={sharedPassage}
              />
            </div>
            <DraggableDivider onResize={handleResize} />
            <div 
              className="question-area"
              style={{ width: `${questionWidth}%` }}
            >
              <QuestionView 
                selectedTest={selectedTest} 
                user={user} 
                testStarted={testStarted}
                onTestReset={handleTestReset}
                sharedPassage={sharedPassage}
                onPassageChange={handlePassageChange}
                testSubmitted={testSubmitted}
                testResults={testResults}
                onTestSubmit={handleSubmit}
              />
            </div>
          </div>
        </HighlightProvider>
      )}
      {selectedTest.type === 'Listening' && (
        <div className="listening-layout">
          <div className="questions-section">
            <ListeningQuestionView 
              selectedTest={{
                ...selectedTest,
                audioSrc: testData.sources && testData.sources.length > 0 
                  ? `${API_BASE}/assets/${testData.sources[0].contentPath}` 
                  : null
              }} 
              user={user} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TestViewer; 
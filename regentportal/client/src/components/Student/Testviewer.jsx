import React, { useEffect, useState } from 'react';
import ReadingTest from './ReadingTest';
import ListeningTest from './ListeningTest';
import QuestionView from './QuestionView';
import ListeningQuestionView from './ListeningQuestionView';
import DraggableDivider from './DraggableDivider';

const TestViewer = ({ selectedTest, user }) => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passageWidth, setPassageWidth] = useState(56);
  const [questionWidth, setQuestionWidth] = useState(44);

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
          endpoint = `/api/tests/${selectedTest.testId._id}/reading`;
        } else if (selectedTest.type === 'Listening') {
          endpoint = `/api/tests/${selectedTest.testId._id}/listening`;
        } else {
          // Fallback to generic endpoint with test type parameter
          endpoint = `/api/tests/${selectedTest.testId._id}?testType=${selectedTest.type}`;
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
  
  const handleResize = (newPassageWidth, newQuestionWidth) => {
    setPassageWidth(newPassageWidth);
    setQuestionWidth(newQuestionWidth);
  };

  return (
    <>
      {selectedTest.type === 'Reading' && (
        <div className="test-viewer-container">
          <div 
            className="test-content-area"
            style={{ width: `${passageWidth}%` }}
          >
            <ReadingTest testId={selectedTest.testId} testData={testData} />
          </div>
          <DraggableDivider onResize={handleResize} />
          <div 
            className="question-area"
            style={{ width: `${questionWidth}%` }}
          >
            <QuestionView selectedTest={selectedTest} user={user} />
          </div>
        </div>
      )}
      {selectedTest.type === 'Listening' && (
        <div className="listening-layout">
          <div className="audio-section">
            <ListeningTest testId={selectedTest.testId} testData={testData} />
          </div>
          <div className="questions-section">
            <ListeningQuestionView selectedTest={selectedTest} user={user} />
          </div>
        </div>
      )}
    </>
  );
};

export default TestViewer; 
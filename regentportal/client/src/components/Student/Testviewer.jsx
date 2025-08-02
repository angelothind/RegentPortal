import React, { useEffect, useState } from 'react';
import ReadingTest from './ReadingTest';
import ListeningTest from './ListeningTest';
import QuestionView from './QuestionView';
import ListeningQuestionView from './ListeningQuestionView';

const TestViewer = ({ selectedTest, user }) => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!selectedTest) {
        setTestData(null);
        return;
      }

      console.log('🔍 TestViewer: Fetching test data for:', selectedTest);
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
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📋 TestViewer: Received test data:', data);
        
        // Backend now sends only the appropriate sources, no need to filter on frontend
        setTestData(data);
      } catch (error) {
        console.error('❌ Failed to fetch test data:', error);
        setTestData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [selectedTest]);

  if (!selectedTest) return <div className="main-content">Please select a test</div>;
  if (loading) return <div className="main-content">Loading test data...</div>;
  if (!testData) return <div className="main-content">No test data available</div>;

  console.log('🎯 TestViewer render - selectedTest:', selectedTest);
  console.log('🎯 TestViewer render - selectedTest.type:', selectedTest?.type);
  
  return (
    <>
      {selectedTest.type === 'Reading' && (
        <div className="test-viewer-container">
          <div className="test-content-area">
            <ReadingTest testId={selectedTest.testId} testData={testData} />
          </div>
          <div className="question-area">
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
import React, { useEffect, useState } from 'react';
import ReadingTest from './ReadingTest';
import ListeningTest from './ListeningTest';

const TestViewer = ({ selectedTest }) => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!selectedTest) {
        setTestData(null);
        return;
      }

      setLoading(true);
      try {
        // 🔒 SECURE: Use specific endpoints based on test type
        let endpoint;
        if (selectedTest.type === 'Reading') {
          endpoint = `/api/tests/${selectedTest.testId._id}/reading`;
        } else if (selectedTest.type === 'Listening') {
          endpoint = `/api/tests/${selectedTest.testId._id}/listening`;
        } else {
          // Fallback to generic endpoint with test type parameter
          endpoint = `/api/tests/${selectedTest.testId._id}?testType=${selectedTest.type}`;
        }

        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
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

  return (
    <div className="test-viewer-container">
      {selectedTest.type === 'Reading' && (
        <ReadingTest testId={selectedTest.testId} testData={testData} />
      )}
      {selectedTest.type === 'Listening' && (
        <ListeningTest testId={selectedTest.testId} testData={testData} />
      )}
    </div>
  );
};

export default TestViewer;
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
        const res = await fetch(`/api/test/${selectedTest.testId._id}`);
        const data = await res.json();
        const filteredSources = data.sources.filter(src => src.sourceType === selectedTest.type);
        setTestData({ ...data, sources: filteredSources });
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
// TestViewer.jsx
import React from 'react';
import ReadingTest from './ReadingTest';
import ListeningTest from './ListeningTest';

const TestViewer = ({ selectedTest }) => {
  if (!selectedTest) return <div className="main-content">Please select a test</div>;

  return (
    <div className="main-content">
      {selectedTest.type === 'Reading' && <ReadingTest testId={selectedTest.testId} />}
      {selectedTest.type === 'Listening' && <ListeningTest testId={selectedTest.testId} />}
    </div>
  );
};

export default TestViewer;
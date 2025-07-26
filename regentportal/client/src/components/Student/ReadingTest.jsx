import React from 'react';
import './ReadingTest.css'; // You'll create this CSS file

const ReadingTest = ({ sources }) => {
  const passageSources = sources.filter(src => src.name.includes('passage'));

  return (
    <div className="reading-test-container">
      <div className="passage-section">
        {passageSources.map((src, idx) => (
          <div key={idx} className="passage-block">
            <h3>{src.name}</h3>
            {/* Later replace with dynamic import or real content */}
            <pre className="passage-content">
              Loading content from: {src.contentPath}
            </pre>
          </div>
        ))}
      </div>
      <div className="question-section">
        <h3>Questions will go here</h3>
      </div>
    </div>
  );
};

export default ReadingTest;
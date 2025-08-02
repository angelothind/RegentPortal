// ReadingTest.jsx
import React, { useEffect, useState } from 'react';
import '../../styles/UserLayout/ReadingTest.css';

const ReadingTest = ({ testId, testData }) => {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [passageContent, setPassageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);

  const handleStartTest = () => {
    setTestStarted(true);
    console.log('🚀 Reading test started');
  };

  useEffect(() => {
    const loadPassageContent = async () => {
      if (!testData || !testData.sources || testData.sources.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 🔒 SECURE: Backend already filtered for JSON sources only
        // No need to filter again on frontend
        if (testData.sources.length > 0) {
          const currentSource = testData.sources[currentPassage];
          
          // Backend already sent the parsed JSON content
          if (currentSource && currentSource.content) {
            setPassageContent(currentSource.content);
          } else {
            // Fallback: fetch JSON content if not provided by backend
            const fetchUrl = `/assets/${currentSource.contentPath}`;
            const response = await fetch(fetchUrl);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setPassageContent(data);
          }
        }
      } catch (err) {
        console.error('❌ Failed to load passage content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPassageContent();
  }, [testData, currentPassage]);

  if (loading) {
    return (
      <div className="reading-test-container">
        <div className="loading">Loading passage...</div>
      </div>
    );
  }

  if (!passageContent) {
    return (
      <div className="reading-test-container">
        <div className="error">No passage content available</div>
      </div>
    );
  }

  return (
    <div className="reading-test-container">
      <div className="passage-section">
        <div className="passage-header">
          <div className="passage-title-section">
            <h2>{passageContent.title}</h2>
            {passageContent.hasSubtitle && passageContent.subtitle && (
              <p className="passage-subtitle">{passageContent.subtitle}</p>
            )}
          </div>
          <div className="passage-controls">
            {testData.sources.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentPassage(index)}
                className={currentPassage === index ? 'active' : ''}
              >
                Passage {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        <div className="passage-content">
          {passageContent.paragraphs.map((paragraph, index) => (
            <div key={index} className="paragraph">
              {paragraph.label && <strong>{paragraph.label}</strong>}
              <p>{paragraph.text}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Start Test Overlay */}
      {!testStarted && (
        <div className="test-overlay">
          <div className="overlay-content">
            <h2>Ready to Start?</h2>
            <p>You're about to begin the Reading Test. Make sure you're in a comfortable environment and ready to focus.</p>
            <button className="start-test-button" onClick={handleStartTest}>
              Start Test Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingTest;
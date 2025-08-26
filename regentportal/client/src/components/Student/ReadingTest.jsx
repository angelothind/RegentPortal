// ReadingTest.jsx
import React, { useEffect, useState } from 'react';
import '../../styles/UserLayout/ReadingTest.css';

const ReadingTest = ({ testId, testData, onPassageChange, currentPassage, isTeacherMode = false }) => {
  const [passageContent, setPassageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log('🎯 ReadingTest: isTeacherMode:', isTeacherMode);



  const handlePassageChange = (passageNumber) => {
    if (onPassageChange) {
      onPassageChange(passageNumber);
    }
    console.log('🔄 ReadingTest: Switching to passage:', passageNumber);
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
          // Convert 1-based passage number to 0-based array index
          // Only allow passages 1, 2, and 3
          const passageIndex = Math.min(currentPassage - 1, 2); // Max index is 2 (for passage 3)
          const currentSource = testData.sources[passageIndex];
          
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
          <div className="passage-controls">
            {/* Limit to exactly 3 passages for reading tests */}
            {[1, 2, 3].map((passageNumber) => (
              <button 
                key={passageNumber}
                onClick={() => handlePassageChange(passageNumber)}
                className={currentPassage === passageNumber ? 'active' : ''}
              >
                Passage {passageNumber}
              </button>
            ))}
          </div>
        </div>
        
        <div className="passage-content">
          <div className="passage-title-section">
            <h2>{passageContent.title}</h2>
            {passageContent.hasSubtitle && passageContent.subtitle && (
              <p className="passage-subtitle">{passageContent.subtitle}</p>
            )}
          </div>
          {passageContent.paragraphs.map((paragraph, index) => (
            <div key={index} className="paragraph">
              {paragraph.label && <strong>{paragraph.label}</strong>}
              <p>{paragraph.text}</p>
            </div>
          ))}
        </div>
      </div>
      

      

    </div>
  );
};

export default ReadingTest;
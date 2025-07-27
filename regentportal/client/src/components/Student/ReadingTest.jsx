// ReadingTest.jsx
import React, { useEffect, useState } from 'react';
import '../../styles/UserLayout/ReadingTest.css';

const ReadingTest = ({ testId, testData }) => {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [passageContent, setPassageContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPassageContent = async () => {
      if (!testData || !testData.sources || testData.sources.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get the first reading passage (JSON file)
        const readingSources = testData.sources.filter(source => 
          source.contentPath && source.contentPath.endsWith('.json')
        );

        if (readingSources.length > 0) {
          const firstPassage = readingSources[currentPassage];
          
          // Add /assets/ prefix to the contentPath from database
          const fetchUrl = `/assets/${firstPassage.contentPath}`;
          
          const response = await fetch(fetchUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          setPassageContent(data);
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
        <div className="passage-section">
          <div className="loading">Loading passage...</div>
        </div>
      </div>
    );
  }

  if (!passageContent) {
    return (
      <div className="reading-test-container">
        <div className="passage-section">
          <div className="error">No passage content available</div>
        </div>
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
            {testData.sources
              .filter(source => source.contentPath && source.contentPath.endsWith('.json'))
              .map((_, index) => (
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
    </div>
  );
};

export default ReadingTest;
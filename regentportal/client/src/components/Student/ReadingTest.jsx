// ReadingTest.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/UserLayout/ReadingTest.css';
import API_BASE from '../../utils/api';
import HighlightableArea from './HighlightableArea';

const ReadingTest = ({ testId, testData, onPassageChange, currentPassage, isTeacherMode = false, isFullscreen = false, onToggleFullscreen }) => {
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
        setPassageContent(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (testData.sources.length > 0) {
          const passageIndex = Math.min(currentPassage - 1, 2);
          const currentSource = testData.sources[passageIndex];

          if (currentSource && currentSource.content) {
            setPassageContent(currentSource.content);
          } else if (currentSource?.contentPath?.toLowerCase().endsWith('.json')) {
            const fetchUrl = `${API_BASE}/assets/${currentSource.contentPath}`;
            const response = await fetch(fetchUrl);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPassageContent(data);
          } else {
            setPassageContent(null);
          }
        }
      } catch (err) {
        console.error('❌ Failed to load passage content:', err);
        setPassageContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadPassageContent();
  }, [testData, currentPassage]);

  const contentVersion = useMemo(() => {
    if (loading) return `${currentPassage}-loading`;
    if (!passageContent) return `${currentPassage}-empty`;
    return `${currentPassage}-${passageContent.title || 'ready'}`;
  }, [currentPassage, loading, passageContent]);

  return (
    <div className="reading-test-container">
      <div className="passage-section">
        <div className="passage-header">
          <div className="passage-controls">
            {[1, 2, 3].map((passageNumber) => (
              <button
                key={passageNumber}
                onClick={() => handlePassageChange(passageNumber)}
                className={currentPassage === passageNumber ? 'active' : ''}
              >
                Passage {passageNumber}
              </button>
            ))}
            {isFullscreen && (
              <button
                type="button"
                className="passage-exit-fullscreen"
                onClick={onToggleFullscreen}
                aria-label="Exit fullscreen"
                title="Exit fullscreen"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <HighlightableArea
          regionId={`reading-passage-${currentPassage}`}
          className="passage-content"
          contentVersion={contentVersion}
        >
          {loading ? (
            <div className="loading">Loading passage...</div>
          ) : !passageContent ? (
            <div className="error">No passage content available</div>
          ) : (
            <>
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
            </>
          )}
        </HighlightableArea>
      </div>
    </div>
  );
};

export default ReadingTest;

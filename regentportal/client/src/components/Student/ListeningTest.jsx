import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer';
import '../../styles/UserLayout/ListeningTest.css';

const ListeningTest = ({ testId, testData }) => {
  const [audioSources, setAudioSources] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(0);

  useEffect(() => {
    if (!testData || !testData.sources) return;

    // 🔒 SECURE: Backend already filtered for MP3 sources only
    // No need to filter again on frontend
    setAudioSources(testData.sources);
  }, [testData]);

  if (!testData) {
    return (
      <div className="listening-test-container">
        <div className="error">No test data available</div>
      </div>
    );
  }

  return (
    <div className="listening-test-container">
      {/* Audio Section - Top 25% */}
      <div className="audio-section">
        {audioSources.length > 0 ? (
          <AudioPlayer 
            audioSrc={`/assets/${audioSources[0].contentPath}`}
            title="Listening Test Audio"
          />
        ) : (
          <div className="no-audio">
            <p>No audio sources available for this test.</p>
          </div>
        )}
      </div>
      
      {/* Questions Section - Bottom 75% */}
      <div className="questions-section">
        <div className="questions-content">
          <h3>Questions</h3>
          <p>Questions will appear here in the future.</p>
        </div>
      </div>
    </div>
  );
};

export default ListeningTest;

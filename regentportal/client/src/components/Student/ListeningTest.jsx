import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer';
import '../../styles/UserLayout/ListeningTest.css';

const ListeningTest = ({ testId, testData }) => {
  const [audioSources, setAudioSources] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(0);

  useEffect(() => {
    if (!testData || !testData.sources) return;

    // Get audio sources from test data
    const audioSources = testData.sources.filter(source => 
      source.contentPath && source.contentPath.endsWith('.mp3')
    );
    setAudioSources(audioSources);
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
      {/* Audio Section - Top 20% */}
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
      
      {/* Questions Section - Bottom 80% */}
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

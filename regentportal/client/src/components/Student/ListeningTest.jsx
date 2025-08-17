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
      {/* Audio section completely removed - now integrated into question header */}
    </div>
  );
};

export default ListeningTest;

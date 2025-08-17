import React, { useState, useRef } from 'react';
import '../../styles/UserLayout/CompactAudioPlayer.css';

const CompactAudioPlayer = ({ audioSrc, title = "Audio" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="compact-audio-player">
      <div className="audio-info">
        <span className="audio-title">{title}</span>
        <span className="audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      
      <div className="audio-controls">
        <button 
          className={`play-pause-btn ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
          )}
        </button>
        
        <div className="progress-container">
          <div className="progress-bar" onClick={handleSeek}>
            <div 
              className="progress-fill" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default CompactAudioPlayer; 
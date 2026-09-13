import React from 'react';
import '../../styles/Student/ExamTimerBar.css';

const formatRemainingTime = (remainingMs) => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ExamTimerBar = ({ remainingMs, isExpired, visible }) => {
  if (!visible) {
    return null;
  }

  const isWarningTime = !isExpired && remainingMs <= 5 * 60 * 1000;

  return (
    <div
      className={`exam-timer-bar${isExpired ? ' expired' : ''}${isWarningTime ? ' warning-time' : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={isExpired ? 'Exam timer expired' : `Time remaining: ${formatRemainingTime(remainingMs)}`}
    >
      <span className="exam-timer-label">Time remaining</span>
      <span className="exam-timer-value">
        {isExpired ? '00:00' : formatRemainingTime(remainingMs)}
      </span>
    </div>
  );
};

export default ExamTimerBar;

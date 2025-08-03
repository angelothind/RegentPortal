import React, { useState, useEffect } from 'react';
import '../../styles/Admin/StudentTable.css';

const StudentDetails = ({ student, onBack }) => {
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    reading: true,
    listening: true
  });

  useEffect(() => {
    if (student) {
      fetchStudentSubmissions();
    }
  }, [student]);

  const fetchStudentSubmissions = async () => {
    if (!student) return;

    try {
      const response = await fetch(`/api/teachers/submissions/student/${student._id}`);
      const data = await response.json();
      setTestSubmissions(data.submissions || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch student submissions:', err);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getScoreColor = (score) => {
    if (score === 0) return '#6c757d'; // Gray for empty submissions
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTestClick = (submission) => {
    setSelectedTest(submission);
  };

  const handleCloseTestView = () => {
    setSelectedTest(null);
  };

  if (loading) {
    return (
      <div className="student-details-container">
        <div className="loading">Loading student details...</div>
      </div>
    );
  }

  // Filter and process submissions
  const completedSubmissions = testSubmissions.filter(sub => sub.score > 0);
  const readingSubmissions = completedSubmissions.filter(sub => sub.testType.toLowerCase() === 'reading');
  const listeningSubmissions = completedSubmissions.filter(sub => sub.testType.toLowerCase() === 'listening');

  // Get first submission per test for averages
  const getFirstSubmissionsByTest = (submissions) => {
    const testMap = new Map();
    submissions.forEach(sub => {
      const testKey = `${sub.testId}-${sub.testType}`;
      if (!testMap.has(testKey) || sub.submittedAt < testMap.get(testKey).submittedAt) {
        testMap.set(testKey, sub);
      }
    });
    return Array.from(testMap.values());
  };

  const firstReadingSubmissions = getFirstSubmissionsByTest(readingSubmissions);
  const firstListeningSubmissions = getFirstSubmissionsByTest(listeningSubmissions);

  // Calculate averages
  const readingAverage = firstReadingSubmissions.length > 0 
    ? Math.round(firstReadingSubmissions.reduce((sum, sub) => sum + sub.score, 0) / firstReadingSubmissions.length)
    : 0;

  const listeningAverage = firstListeningSubmissions.length > 0 
    ? Math.round(firstListeningSubmissions.reduce((sum, sub) => sum + sub.score, 0) / firstListeningSubmissions.length)
    : 0;

  const bestScore = completedSubmissions.length > 0 
    ? Math.max(...completedSubmissions.map(sub => sub.score))
    : 0;

  // If showing detailed test view
  if (selectedTest) {
    return (
      <div className="student-details-container">
        <div className="test-detail-view">
          <div className="test-detail-header">
            <button className="back-button" onClick={handleCloseTestView}>
              ← Back to Student Details
            </button>
            <h2>{selectedTest.testTitle}</h2>
            <div className="test-detail-info">
              <span className="book-name">{selectedTest.bookTitle}</span>
              <span className="test-name">{selectedTest.testName}</span>
              <span className="test-type">{selectedTest.testType}</span>
              <span 
                className="score-badge"
                style={{ backgroundColor: getScoreColor(selectedTest.score) }}
              >
                {selectedTest.score === 0 ? 'Empty' : `${selectedTest.score}%`}
              </span>
            </div>
          </div>
          
          <div className="test-detail-content">
            <div className="test-summary">
              <p><strong>Submitted:</strong> {formatDate(selectedTest.submittedAt)}</p>
              <p><strong>Correct Answers:</strong> {selectedTest.correctCount}/{selectedTest.totalQuestions}</p>
            </div>
            
            <div className="answers-detail">
              <h3>Answer Details</h3>
              <div className="answers-list">
                {selectedTest.answers && selectedTest.answers.map((answer, answerIndex) => (
                  <div key={answerIndex} className="answer-item">
                    <div className="answer-header">
                      <span className="question-number">Question {answerIndex + 1}</span>
                      <span className={`result ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                        {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <div className="answer-content">
                      <div className="answer-detail">
                        <span className="detail-label">Student Answer:</span>
                        <span className="student-answer">{answer.studentAnswer || 'No answer'}</span>
                      </div>
                      <div className="answer-detail">
                        <span className="detail-label">Correct Answer:</span>
                        <span className="correct-answer">{answer.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-details-container">
      {/* Student Info and Back Button */}
      <div className="student-info-header">
        <div className="student-info">
          <h2>{student.name}</h2>
          <p className="student-username">Username: {student.username}</p>
        </div>
        <button className="back-button-small" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Overview Stats Section */}
      <div className="overview-section">
        <h3>Performance Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <h4>Reading Completed</h4>
              <p>{readingSubmissions.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>Reading Average</h4>
              <p>{readingAverage}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎧</div>
            <div className="stat-content">
              <h4>Listening Completed</h4>
              <p>{listeningSubmissions.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>Listening Average</h4>
              <p>{listeningAverage}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h4>Overall Average</h4>
              <p>{Math.round((readingAverage + listeningAverage) / 2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test History Section */}
      <div className="test-history-section">
        <h3>Test History</h3>
        
        {/* Reading Tests */}
        <div className="test-section">
          <div className="section-header" onClick={() => toggleSection('reading')}>
            <h4>📖 Reading Tests ({readingSubmissions.length})</h4>
            <span className="toggle-icon">{expandedSections.reading ? '▼' : '▶'}</span>
          </div>
          {expandedSections.reading && (
            <div className="submissions-list">
              {readingSubmissions.length === 0 ? (
                <div className="no-submissions">
                  <p>No reading tests completed.</p>
                </div>
              ) : (
                readingSubmissions.map((submission, index) => (
                  <div key={index} className="submission-card clickable" onClick={() => handleTestClick(submission)}>
                    <div className="submission-header">
                      <div className="submission-title">
                        <h4 className="clickable-title">{submission.testTitle}</h4>
                        <div className="test-info">
                          <span className="book-name">{submission.bookTitle || 'Unknown Book'}</span>
                          <span className="test-name">{submission.testName || 'Unknown Test'}</span>
                          <span className="test-type">{submission.testType}</span>
                        </div>
                      </div>
                      <div className="submission-score">
                        <span 
                          className="score-badge"
                          style={{ backgroundColor: getScoreColor(submission.score) }}
                        >
                          {submission.score}%
                        </span>
                      </div>
                    </div>
                    <div className="submission-details">
                      <div className="detail-row">
                        <span className="detail-label">Correct Answers:</span>
                        <span className="detail-value">{submission.correctCount}/{submission.totalQuestions}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Submitted:</span>
                        <span className="detail-value">{formatDate(submission.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Listening Tests */}
        <div className="test-section">
          <div className="section-header" onClick={() => toggleSection('listening')}>
            <h4>🎧 Listening Tests ({listeningSubmissions.length})</h4>
            <span className="toggle-icon">{expandedSections.listening ? '▼' : '▶'}</span>
          </div>
          {expandedSections.listening && (
            <div className="submissions-list">
              {listeningSubmissions.length === 0 ? (
                <div className="no-submissions">
                  <p>No listening tests completed.</p>
                </div>
              ) : (
                listeningSubmissions.map((submission, index) => (
                  <div key={index} className="submission-card clickable" onClick={() => handleTestClick(submission)}>
                    <div className="submission-header">
                      <div className="submission-title">
                        <h4 className="clickable-title">{submission.testTitle}</h4>
                        <div className="test-info">
                          <span className="book-name">{submission.bookTitle || 'Unknown Book'}</span>
                          <span className="test-name">{submission.testName || 'Unknown Test'}</span>
                          <span className="test-type">{submission.testType}</span>
                        </div>
                      </div>
                      <div className="submission-score">
                        <span 
                          className="score-badge"
                          style={{ backgroundColor: getScoreColor(submission.score) }}
                        >
                          {submission.score}%
                        </span>
                      </div>
                    </div>
                    <div className="submission-details">
                      <div className="detail-row">
                        <span className="detail-label">Correct Answers:</span>
                        <span className="detail-value">{submission.correctCount}/{submission.totalQuestions}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Submitted:</span>
                        <span className="detail-value">{formatDate(submission.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails; 
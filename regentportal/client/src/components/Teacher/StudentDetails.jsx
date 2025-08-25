import React, { useState, useEffect } from 'react';
import TeacherTestAnalysis from './TeacherTestAnalysis';
import StudentSubmissions from './StudentSubmissions';
import '../../styles/Admin/StudentTable.css';

const StudentDetails = ({ student, onBack }) => {
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    reading: false,
    listening: false
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
    if (score === 0) return '#6c757d'; // Gray for incomplete submissions
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
    console.log('🔍 StudentDetails - Selected submission:', submission);
    console.log('🔍 StudentDetails - submission.testId:', submission.testId);
    console.log('🔍 StudentDetails - typeof submission.testId:', typeof submission.testId);
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

  // Filter and process submissions - show all submissions including score 0
  const allSubmissions = testSubmissions;
  const readingSubmissions = allSubmissions
    .filter(sub => sub.testType.toLowerCase() === 'reading')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)); // Sort by most recent first
  const listeningSubmissions = allSubmissions
    .filter(sub => sub.testType.toLowerCase() === 'listening')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)); // Sort by most recent first

  // Get most recent submission per test for averages (only completed submissions)
  const getMostRecentSubmissionsByTest = (submissions) => {
    const testMap = new Map();
    submissions.forEach(sub => {
      const testKey = `${sub.testId}-${sub.testType}`;
      if (!testMap.has(testKey) || sub.submittedAt > testMap.get(testKey).submittedAt) {
        testMap.set(testKey, sub);
      }
    });
    return Array.from(testMap.values());
  };

  // Filter for completed submissions (score > 0) for averages
  const completedSubmissions = testSubmissions.filter(sub => sub.score > 0);
  const completedReadingSubmissions = readingSubmissions.filter(sub => sub.score > 0);
  const completedListeningSubmissions = listeningSubmissions.filter(sub => sub.score > 0);

  const mostRecentReadingSubmissions = getMostRecentSubmissionsByTest(completedReadingSubmissions);
  const mostRecentListeningSubmissions = getMostRecentSubmissionsByTest(completedListeningSubmissions);

  // Calculate averages (only from completed submissions)
  const readingAverage = mostRecentReadingSubmissions.length > 0 
    ? Math.round(mostRecentReadingSubmissions.reduce((sum, sub) => sum + sub.score, 0) / mostRecentReadingSubmissions.length)
    : 0;

  const listeningAverage = mostRecentListeningSubmissions.length > 0 
    ? Math.round(mostRecentListeningSubmissions.reduce((sum, sub) => sum + sub.score, 0) / mostRecentListeningSubmissions.length)
    : 0;

  const bestScore = completedSubmissions.length > 0 
    ? Math.max(...completedSubmissions.map(sub => sub.score))
    : 0;

  // If showing detailed test view
  if (selectedTest) {
    return (
      <TeacherTestAnalysis 
        submission={selectedTest} 
        onBack={handleCloseTestView}
      />
    );
  }

  return (
    <div className="student-details-container">
      {selectedTest ? (
        <div className="test-view">
          <div className="test-view-header">
            <button className="back-button" onClick={handleCloseTestView}>
              ← Back to Tests
            </button>
            <h3>Test Analysis: {selectedTest.testTitle}</h3>
          </div>
          <StudentSubmissions selectedTest={selectedTest} />
        </div>
      ) : (
        <>
          <div className="student-header">
            <button className="back-button" onClick={onBack}>
              ← Back to Students
            </button>
            <h2>{student.name}</h2>
            <p>Username: {student.username}</p>
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
            <h4>📖 Reading Tests ({readingSubmissions.length} total, {completedReadingSubmissions.length} completed)</h4>
            <span className="toggle-icon">{expandedSections.reading ? '▼' : '▶'}</span>
          </div>
          {expandedSections.reading && (
            <div className="submissions-list">
              {readingSubmissions.length === 0 ? (
                <div className="no-submissions">
                  <p>No reading tests submitted.</p>
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
                          {submission.score === 0 ? 'Incomplete' : `${submission.score}%`}
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
            <h4>🎧 Listening Tests ({listeningSubmissions.length} total, {completedListeningSubmissions.length} completed)</h4>
            <span className="toggle-icon">{expandedSections.listening ? '▼' : '▶'}</span>
          </div>
          {expandedSections.listening && (
            <div className="submissions-list">
              {listeningSubmissions.length === 0 ? (
                <div className="no-submissions">
                  <p>No listening tests submitted.</p>
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
    </>
      )}
    </div>
  );
};

export default StudentDetails; 
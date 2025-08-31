import React, { useState, useEffect } from 'react';
import '../../styles/Admin/StudentTable.css';
import API_BASE from '../../utils/api';

const StudentSubmissions = ({ selectedTest, onSubmissionSelect }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (selectedTest && selectedTest.testId) {
      fetchSubmissions();
    }
  }, [selectedTest]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/submissions/${selectedTest.testId._id}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    if (onSubmissionSelect) {
      onSubmissionSelect(submission);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="student-submissions">
        <div className="loading">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="student-submissions">
      <div className="submissions-header">
        <h3>Student Submissions</h3>
        <p>Total submissions: {submissions.length}</p>
      </div>
      
      <div className="submissions-content">
        <div className="submissions-list">
          <h4>All Submissions</h4>
          {submissions.length === 0 ? (
            <div className="no-submissions">
              <p>No submissions found for this test.</p>
            </div>
          ) : (
            <div className="submissions-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Score</th>
                    <th>Correct/Total</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr 
                      key={submission._id}
                      className={selectedSubmission?._id === submission._id ? 'selected' : ''}
                    >
                      <td>{submission.studentName || 'Unknown Student'}</td>
                      <td>{submission.score}%</td>
                      <td>{submission.correctCount}/{submission.totalQuestions}</td>
                      <td>{formatDate(submission.submittedAt)}</td>
                      <td>
                        <button 
                          className="view-button"
                          onClick={() => handleSubmissionSelect(submission)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {selectedSubmission && (
          <div className="submission-details">
            <h4>Submission Details</h4>
            <div className="detail-section">
              <h5>Student Information</h5>
              <p><strong>Name:</strong> {selectedSubmission.studentName || 'Unknown'}</p>
              <p><strong>Score:</strong> {selectedSubmission.score}%</p>
              <p><strong>Correct Answers:</strong> {selectedSubmission.correctCount}/{selectedSubmission.totalQuestions}</p>
              <p><strong>Submitted:</strong> {formatDate(selectedSubmission.submittedAt)}</p>
            </div>
            
            <div className="detail-section">
              <h5>Answer Details</h5>
              <div className="answers-list">
                {Object.entries(selectedSubmission.answers || {}).map(([questionNumber, answer]) => (
                  <div key={questionNumber} className="answer-item">
                    <span className="question-number">Q{questionNumber}:</span>
                    <span className="student-answer">{answer}</span>
                    <span className="correct-answer">
                      Correct: {selectedSubmission.correctAnswers?.[questionNumber] || 'N/A'}
                    </span>
                    <span className={`result ${selectedSubmission.results?.[questionNumber]?.isCorrect ? 'correct' : 'incorrect'}`}>
                      {selectedSubmission.results?.[questionNumber]?.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubmissions; 
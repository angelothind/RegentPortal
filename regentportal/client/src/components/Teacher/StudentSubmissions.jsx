import React, { useState, useEffect } from 'react';
import '../../styles/UserLayout/TeacherDashboard.css';

const StudentSubmissions = ({ selectedTest }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedTest) {
        setSubmissions([]);
        return;
      }

      console.log('🔍 StudentSubmissions: Fetching submissions for test:', selectedTest.testId._id);
      setLoading(true);
      try {
        const response = await fetch(`/api/submissions/${selectedTest.testId._id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 StudentSubmissions: Received submissions:', data);
        setSubmissions(data.submissions || []);
      } catch (error) {
        console.error('❌ Failed to fetch submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [selectedTest]);

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
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
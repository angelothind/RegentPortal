import React, { useState, useEffect } from 'react';
import ReadingTest from '../Student/ReadingTest';
import ListeningTest from '../Student/ListeningTest';
import QuestionView from '../Student/QuestionView';
import ListeningQuestionView from '../Student/ListeningQuestionView';

const TeacherTestAnalysis = ({ submission, onBack }) => {
  const [testData, setTestData] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!submission) return;

      setLoading(true);
      try {
        // Fetch test data
        const testEndpoint = `/api/tests/${submission.testId._id}`;
        const testResponse = await fetch(testEndpoint);
        if (!testResponse.ok) {
          throw new Error(`HTTP error! status: ${testResponse.status}`);
        }
        const testDataResult = await testResponse.json();
        setTestData(testDataResult);

        // Fetch question data
        const questionEndpoint = `/api/tests/${submission.testId._id}/questions/part1?testType=${submission.testType}`;
        const questionResponse = await fetch(questionEndpoint);
        if (!questionResponse.ok) {
          throw new Error(`HTTP error! status: ${questionResponse.status}`);
        }
        const questionDataResult = await questionResponse.json();
        setQuestionData(questionDataResult);

      } catch (error) {
        console.error('Failed to fetch test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [submission]);

  // Format submission data to match the structure expected by question components
  const formatTestResults = () => {
    if (!submission) return null;

    // Create answers object with question numbers as keys
    const answers = {};
    const correctAnswers = {};
    const results = {};

    // Process answered questions
    submission.answers?.forEach((answer, index) => {
      const questionNumber = index + 1;
      answers[questionNumber] = answer.studentAnswer || '';
      correctAnswers[questionNumber] = answer.correctAnswer || '';
      results[questionNumber] = {
        isCorrect: answer.isCorrect || false,
        studentAnswer: answer.studentAnswer || '',
        correctAnswer: answer.correctAnswer || ''
      };
    });

    // Also use the correctAnswers from submission if available
    if (submission.correctAnswers) {
      Object.keys(submission.correctAnswers).forEach(questionNumber => {
        correctAnswers[questionNumber] = submission.correctAnswers[questionNumber];
        
        // Create results for unanswered questions
        if (!results[questionNumber]) {
          results[questionNumber] = {
            isCorrect: false,
            studentAnswer: '',
            correctAnswer: submission.correctAnswers[questionNumber]
          };
        }
      });
    }

    return {
      score: submission.score,
      correctCount: submission.correctCount,
      totalQuestions: submission.totalQuestions,
      submittedAt: submission.submittedAt,
      answers: answers,
      correctAnswers: correctAnswers,
      results: results
    };
  };

  const formatSelectedTest = () => {
    if (!submission) return null;

    return {
      testId: submission.testId,
      type: submission.testType,
      title: submission.testTitle
    };
  };

  if (loading) {
    return (
      <div className="teacher-test-analysis">
        <div className="loading">Loading test analysis...</div>
      </div>
    );
  }

  if (!submission || !testData) {
    return (
      <div className="teacher-test-analysis">
        <div className="error">No test data available</div>
      </div>
    );
  }

  const testResults = formatTestResults();
  const selectedTest = formatSelectedTest();
  
  console.log('🎯 TeacherTestAnalysis - submission:', submission);
  console.log('🎯 TeacherTestAnalysis - testResults:', testResults);
  console.log('🎯 TeacherTestAnalysis - submission.answers:', submission.answers);
  console.log('🎯 TeacherTestAnalysis - submission.correctAnswers:', submission.correctAnswers);

  return (
    <div className="teacher-test-analysis">
      {/* Header */}
      <div className="analysis-header">
        <button className="back-button-small" onClick={onBack}>
          ← Back to Student Details
        </button>
        <div className="test-info">
          <h2>{submission.testTitle}</h2>
          <div className="test-meta">
            <span className="book-name">{submission.bookTitle}</span>
            <span className="test-name">{submission.testName}</span>
            <span className="test-type">{submission.testType}</span>
            <span className="score-badge" style={{ 
              backgroundColor: submission.score >= 80 ? '#4CAF50' : 
                             submission.score >= 60 ? '#FF9800' : '#f44336' 
            }}>
              {submission.score}%
            </span>
          </div>
        </div>
      </div>

      {/* Test Content and Questions */}
      {submission.testType.toLowerCase() === 'reading' ? (
        <div className="test-viewer-container">
          <div className="test-content-area">
            <ReadingTest testId={submission.testId} testData={testData} isTeacherMode={true} />
          </div>
          <div className="question-area">
            <QuestionView 
              selectedTest={selectedTest} 
              testResults={testResults}
              testSubmitted={true}
              isTeacherMode={true}
              onBackToStudent={onBack}
            />
          </div>
        </div>
      ) : (
        <div className="listening-layout">
          <div className="audio-section">
            <ListeningTest testId={submission.testId} testData={testData} />
          </div>
          <div className="questions-section">
            <ListeningQuestionView 
              selectedTest={selectedTest}
              testResults={testResults}
              testSubmitted={true}
              isTeacherMode={true}
              onBackToStudent={onBack}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTestAnalysis; 
import React, { useState, useEffect } from 'react';
import ReadingTest from '../Student/ReadingTest';
import ListeningTest from '../Student/ListeningTest';
import QuestionView from '../Student/QuestionView';
import ListeningQuestionView from '../Student/ListeningQuestionView';

const TeacherTestAnalysis = ({ submission, onBack }) => {
  const [testData, setTestData] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🎯 TeacherTestAnalysis - Received submission:', submission);
  console.log('🎯 TeacherTestAnalysis - submission.answers:', submission?.answers);
  console.log('🎯 TeacherTestAnalysis - submission.results:', submission?.results);
  console.log('🎯 TeacherTestAnalysis - submission.correctAnswers:', submission?.correctAnswers);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!submission) return;

      setLoading(true);
      try {
        // Fetch complete submission data if we only have basic info
        let completeSubmission = submission;
        if (!submission.answers || !submission.results || !submission.correctAnswers) {
          console.log('🔍 Fetching complete submission data...');
          const submissionResponse = await fetch(`/api/submissions/submission/${submission._id}`);
          if (submissionResponse.ok) {
            completeSubmission = await submissionResponse.json();
            console.log('✅ Complete submission data fetched:', completeSubmission);
            // Update the submission object with complete data
            Object.assign(submission, completeSubmission);
          } else {
            console.error('❌ Failed to fetch complete submission data');
          }
        }

        // Extract testId value for API calls
        let testIdForAPI;
        if (typeof completeSubmission.testId === 'object' && completeSubmission.testId._id) {
          testIdForAPI = completeSubmission.testId._id;
        } else {
          testIdForAPI = completeSubmission.testId;
        }
        
        console.log('🔍 API calls - testIdForAPI:', testIdForAPI);
        console.log('🔍 API calls - completeSubmission.testId:', completeSubmission.testId);

        // Fetch test data
        const testEndpoint = `/api/tests/${testIdForAPI}`;
        const testResponse = await fetch(testEndpoint);
        if (!testResponse.ok) {
          throw new Error(`HTTP error! status: ${testResponse.status}`);
        }
        const testDataResult = await testResponse.json();
        setTestData(testDataResult);

        // Fetch question data
        const questionEndpoint = `/api/tests/${testIdForAPI}/questions/part1?testType=${completeSubmission.testType}`;
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

    // Process answers from submission.answers (Map structure)
    if (submission.answers) {
      // Convert Map to object if needed
      const answersMap = submission.answers instanceof Map ? submission.answers : new Map(Object.entries(submission.answers));
      answersMap.forEach((value, key) => {
        const questionNumber = key.toString();
        answers[questionNumber] = value || '';
      });
    }

    // Process results from submission.results (Map structure)
    if (submission.results) {
      // Convert Map to object if needed
      const resultsMap = submission.results instanceof Map ? submission.results : new Map(Object.entries(submission.results));
      resultsMap.forEach((value, key) => {
        const questionNumber = key.toString();
        results[questionNumber] = {
          isCorrect: value.isCorrect || false,
          studentAnswer: value.userAnswer || '',
          correctAnswer: value.correctAnswer || ''
        };
      });
    }

    // Process correctAnswers from submission.correctAnswers (Map structure)
    if (submission.correctAnswers) {
      // Convert Map to object if needed
      const correctAnswersMap = submission.correctAnswers instanceof Map ? submission.correctAnswers : new Map(Object.entries(submission.correctAnswers));
      correctAnswersMap.forEach((value, key) => {
        const questionNumber = key.toString();
        correctAnswers[questionNumber] = value;
        
        // Create results for unanswered questions if not already present
        if (!results[questionNumber]) {
          results[questionNumber] = {
            isCorrect: false,
            studentAnswer: '',
            correctAnswer: value
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
      testId: { _id: testIdValue },
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

  // Extract testId value for use in components
  let testIdValue;
  if (typeof submission.testId === 'object' && submission.testId._id) {
    // If testId is populated (has _id property)
    testIdValue = submission.testId._id;
  } else {
    // If testId is just the string ID
    testIdValue = submission.testId;
  }

  const testResults = formatTestResults();
  const selectedTest = formatSelectedTest();
  
  console.log('🎯 TeacherTestAnalysis - testResults:', testResults);
  console.log('🎯 TeacherTestAnalysis - selectedTest:', selectedTest);
  console.log('🎯 TeacherTestAnalysis - testIdValue:', testIdValue);

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
              backgroundColor: submission.score === 0 ? '#6c757d' :
                             submission.score >= 80 ? '#4CAF50' : 
                             submission.score >= 60 ? '#FF9800' : '#f44336' 
            }}>
              {submission.score === 0 ? 'Incomplete' : `${submission.score}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Test Content and Questions */}
      {submission.testType.toLowerCase() === 'reading' ? (
        <div className="test-viewer-container">
          <div className="test-content-area">
            <ReadingTest testId={{ _id: testIdValue }} testData={testData} isTeacherMode={true} />
          </div>
          <div className="question-area">
            <QuestionView 
              selectedTest={selectedTest} 
              user={null}
              testResults={testResults}
              testSubmitted={true}
              isTeacherMode={true}
            />
          </div>
        </div>
      ) : (
        <div className="listening-layout">
          <div className="audio-section">
            <ListeningTest testId={{ _id: submission.testId }} testData={testData} />
          </div>
          <div className="questions-section">
            <ListeningQuestionView 
              selectedTest={selectedTest}
              user={null}
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
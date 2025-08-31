import React, { useState, useEffect } from 'react';
import ReadingTest from '../Student/ReadingTest';
import ListeningTest from '../Student/ListeningTest';
import QuestionView from '../Student/QuestionView';
import ListeningQuestionView from '../Student/ListeningQuestionView';
import DraggableDivider from '../Student/DraggableDivider';
import API_BASE from '../../utils/api';

const TeacherTestAnalysis = ({ submission, onBack }) => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharedPassage, setSharedPassage] = useState(1); // Use sharedPassage like student version
  
  // Add resizable layout state like student view
  const [passageWidth, setPassageWidth] = useState(56);
  const [questionWidth, setQuestionWidth] = useState(44);

  console.log('🎯 TeacherTestAnalysis - Received submission:', submission);
  console.log('🎯 TeacherTestAnalysis - submission.answers:', submission?.answers);
  console.log('🎯 TeacherTestAnalysis - submission.results:', submission?.results);
  console.log('🎯 TeacherTestAnalysis - submission.correctAnswers:', submission?.correctAnswers);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!submission) return;

      console.log('🔄 TeacherTestAnalysis: Fetching test data for submission:', submission._id);
      console.log('🔄 TeacherTestAnalysis: Current submission:', submission);
      
      setLoading(true);
      try {
        // Fetch complete submission data if we only have basic info
        let completeSubmission = submission;
        if (!submission.answers || !submission.results || !submission.correctAnswers) {
          console.log('🔍 Fetching complete submission data...');
          const submissionResponse = await fetch(`${API_BASE}/api/submissions/submission/${submission._id}`);
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
        const testEndpoint = `${API_BASE}/api/test/${testIdForAPI}`;
        const testResponse = await fetch(testEndpoint);
        if (!testResponse.ok) {
          throw new Error(`HTTP error! status: ${testResponse.status}`);
        }
        const testDataResult = await testResponse.json();
        setTestData(testDataResult);

        // Remove question data fetching since QuestionView handles it
      } catch (error) {
        console.error('Failed to fetch test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [submission, submission?._id]);

  const handlePassageChange = (newPassage) => {
    console.log('🔄 TeacherTestAnalysis: Changing passage from', sharedPassage, 'to', newPassage);
    setSharedPassage(newPassage);
  };

  // Add resize handler like student view
  const handleResize = (newPassageWidth, newQuestionWidth) => {
    setPassageWidth(newPassageWidth);
    setQuestionWidth(newQuestionWidth);
  };

  // Format submission data to match the structure expected by question components
  const formatTestResults = () => {
    if (!submission) return null;

    console.log('🔍 formatTestResults - Raw submission data:', submission);
    console.log('🔍 formatTestResults - submission.answers type:', typeof submission.answers);
    console.log('🔍 formatTestResults - submission.results type:', typeof submission.results);
    console.log('🔍 formatTestResults - submission.correctAnswers type:', typeof submission.correctAnswers);

    // Create answers object with question numbers as keys
    const answers = {};
    const correctAnswers = {};
    const results = {};

    // Process answers from submission.answers
    if (submission.answers) {
      if (submission.answers instanceof Map) {
        // Handle Map structure
        submission.answers.forEach((value, key) => {
          const questionNumber = key.toString();
          answers[questionNumber] = value || '';
        });
      } else if (Array.isArray(submission.answers)) {
        // Handle array structure
        submission.answers.forEach((item, index) => {
          if (item && item.questionNumber) {
            answers[item.questionNumber] = item.answer || '';
          }
        });
      } else if (typeof submission.answers === 'object') {
        // Handle object structure
        Object.keys(submission.answers).forEach(key => {
          answers[key] = submission.answers[key] || '';
        });
      }
    }

    // Process results from submission.results
    if (submission.results) {
      if (submission.results instanceof Map) {
        // Handle Map structure
        submission.results.forEach((value, key) => {
          const questionNumber = key.toString();
          results[questionNumber] = {
            isCorrect: value.isCorrect || false,
            studentAnswer: value.userAnswer || value.studentAnswer || '',
            correctAnswer: value.correctAnswer || ''
          };
        });
      } else if (Array.isArray(submission.results)) {
        // Handle array structure
        submission.results.forEach((item, index) => {
          if (item && item.questionNumber) {
            results[item.questionNumber] = {
              isCorrect: item.isCorrect || false,
              studentAnswer: item.userAnswer || item.studentAnswer || '',
              correctAnswer: item.correctAnswer || ''
            };
          }
        });
      } else if (typeof submission.results === 'object') {
        // Handle object structure
        Object.keys(submission.results).forEach(key => {
          const value = submission.results[key];
          results[key] = {
            isCorrect: value.isCorrect || false,
            studentAnswer: value.userAnswer || value.studentAnswer || '',
            correctAnswer: value.correctAnswer || ''
          };
        });
      }
    }

    // Process correctAnswers from submission.correctAnswers
    if (submission.correctAnswers) {
      if (submission.correctAnswers instanceof Map) {
        // Handle Map structure
        submission.correctAnswers.forEach((value, key) => {
          const questionNumber = key.toString();
          correctAnswers[questionNumber] = value;
          
          // Create results for unanswered questions if not already present
          if (!results[questionNumber]) {
            results[questionNumber] = {
              isCorrect: false,
              studentAnswer: answers[questionNumber] || '',
              correctAnswer: value
            };
          }
        });
      } else if (Array.isArray(submission.correctAnswers)) {
        // Handle array structure
        submission.correctAnswers.forEach((item, index) => {
          if (item && item.questionNumber) {
            correctAnswers[item.questionNumber] = item.correctAnswer || item.answer || '';
            
            // Create results for unanswered questions if not already present
            if (!results[item.questionNumber]) {
              results[item.questionNumber] = {
                isCorrect: false,
                studentAnswer: answers[item.questionNumber] || '',
                correctAnswer: item.correctAnswer || item.answer || ''
              };
            }
          }
        });
      } else if (typeof submission.correctAnswers === 'object') {
        // Handle object structure
        Object.keys(submission.correctAnswers).forEach(key => {
          const value = submission.correctAnswers[key];
          correctAnswers[key] = value;
          
          // Create results for unanswered questions if not already present
          if (!results[key]) {
            results[key] = {
              isCorrect: false,
              studentAnswer: answers[key] || '',
              correctAnswer: value
            };
          }
        });
      }
    }

    console.log('🔍 formatTestResults - Processed answers:', answers);
    console.log('🔍 formatTestResults - Processed correctAnswers:', correctAnswers);
    console.log('🔍 formatTestResults - Processed results:', results);

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

  // Extract testId value for use in components
  let testIdValue;
  if (typeof submission.testId === 'object' && submission.testId._id) {
    // If testId is populated (has _id property)
    testIdValue = submission.testId._id;
  } else {
    // If testId is just the string ID
    testIdValue = submission.testId;
  }

  const formatSelectedTest = () => {
    if (!submission) return null;

    return {
      testId: { _id: testIdValue },
      type: submission.testType,
      title: submission.testTitle
    };
  };

  const testResults = formatTestResults();
  const selectedTest = formatSelectedTest();
  
  console.log('🎯 TeacherTestAnalysis - testResults:', testResults);
  console.log('🎯 TeacherTestAnalysis - selectedTest:', selectedTest);
  console.log('🎯 TeacherTestAnalysis - testIdValue:', testIdValue);
  console.log('🎯 TeacherTestAnalysis - testData:', testData);
  console.log('🎯 TeacherTestAnalysis - testData.sources:', testData?.sources);
  console.log('🎯 TeacherTestAnalysis - submission.testType:', submission.testType);

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

  return (
    <div className="teacher-test-analysis">
      {/* Header */}
      <div className="analysis-header">
        <button className="back-button-small" onClick={onBack}>
          ← Back to Student Details
        </button>
        <div className="test-info">
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
      {console.log('🎯 About to render test type:', submission.testType.toLowerCase())}
      {submission.testType.toLowerCase() === 'reading' ? (
        <div className="test-viewer-container">
          <div 
            className="test-content-area"
            style={{ width: `${passageWidth}%` }}
          >
            <ReadingTest 
              testId={{ _id: testIdValue }} 
              testData={testData} 
              isTeacherMode={true}
              currentPassage={sharedPassage}
              onPassageChange={handlePassageChange}
            />
          </div>
          <DraggableDivider onResize={handleResize} />
          <div 
            className="question-area"
            style={{ width: `${questionWidth}%` }}
          >
            <QuestionView 
              selectedTest={selectedTest} 
              user={null}
              testResults={testResults}
              testSubmitted={true}
              isTeacherMode={true}
              sharedPassage={sharedPassage}
              onPassageChange={handlePassageChange}
              testData={testData} // Pass testData so QuestionView can fetch questions
            />
          </div>
        </div>
      ) : (
        <div className="listening-layout" style={{ 
          position: 'relative',
          minHeight: 'auto',
          height: 'auto',
          overflow: 'visible'
        }}>
          <div className="audio-section">
            <ListeningTest 
              testId={{ _id: testIdValue }} 
              testData={testData} 
            />
          </div>
          <div className="questions-section" style={{ 
            position: 'relative',
            minHeight: '800px',
            height: 'auto',
            overflow: 'visible'
          }}>
            <ListeningQuestionView 
              selectedTest={{
                ...selectedTest,
                audioSrc: (() => {
                  if (!testData.sources || testData.sources.length === 0) return null;
                  const audioSource = testData.sources.find(source => 
                    source.contentPath && source.contentPath.endsWith('.mp3')
                  );
                  return audioSource ? `${API_BASE}/assets/${audioSource.contentPath}` : null;
                })()
              }}
              user={null}
              testResults={testResults}
              testSubmitted={true}
              isTeacherMode={true}
              onBackToStudent={onBack}
              testData={testData}
              sharedPassage={sharedPassage}
              onPassageChange={handlePassageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTestAnalysis; 
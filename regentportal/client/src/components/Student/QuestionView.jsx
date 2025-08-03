import React, { useState, useEffect } from 'react';
import ChooseXWords from '../Questions/ChooseXWords';
import TFNG from '../Questions/TFNG';
import Matching from '../Questions/Matching';
import MultipleChoiceTwo from '../Questions/MultipleChoiceTwo';
import SummaryCompletion from '../Questions/SummaryCompletion';

const QuestionView = ({ selectedTest }) => {
  console.log('🚀 QuestionView component mounted with selectedTest:', selectedTest);
  
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPassage, setCurrentPassage] = useState(1);

  // Load saved answers from localStorage on component mount
  useEffect(() => {
    if (selectedTest && selectedTest.testId) {
      const savedAnswers = localStorage.getItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`);
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          
          // Check if data is older than 4 hours
          const savedTimestamp = parsedAnswers._timestamp;
          const currentTime = Date.now();
          const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
          
          if (savedTimestamp && (currentTime - savedTimestamp) > fourHours) {
            // Data is older than 4 hours, clear it
            localStorage.removeItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`);
            console.log('📝 Cleared expired saved answers (older than 4 hours)');
            return;
          }
          
          setAnswers(parsedAnswers);
          console.log('📝 Loaded saved answers from localStorage:', parsedAnswers);
        } catch (error) {
          console.error('❌ Error parsing saved answers:', error);
        }
      }
    }
  }, [selectedTest]);

  // Add refresh confirmation warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
        return '⚠️ WARNING: You have unsaved test answers! Your progress will be lost if you leave this page. Are you sure you want to continue?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers]);

  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!selectedTest) {
        console.log('❌ No selectedTest provided to QuestionView');
        setQuestionData(null);
        return;
      }

      console.log('🔍 QuestionView: Fetching questions for passage:', currentPassage);
      setLoading(true);
      setError(null);

      try {
        // Fetch question data for current passage with test type
        const endpoint = `/api/tests/${selectedTest.testId._id}/questions/part${currentPassage}?testType=${selectedTest.type}`;
        console.log('📡 Fetching from endpoint:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 Question data loaded:', data);
        console.log('📋 Question templates:', data.questionData?.templates);
        setQuestionData(data);
      } catch (error) {
        console.error('❌ Failed to fetch question data:', error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [selectedTest, currentPassage]);

  const handleAnswerChange = (questionNumber, value) => {
    const newAnswers = { ...answers, [questionNumber]: value };
    setAnswers(newAnswers);
    
    // Save answers to localStorage with timestamp
    if (selectedTest && selectedTest.testId) {
      const answersWithTimestamp = {
        ...newAnswers,
        _timestamp: Date.now()
      };
      localStorage.setItem(`test-answers-${selectedTest.testId._id}-${selectedTest.type}`, JSON.stringify(answersWithTimestamp));
      console.log('📝 Answers saved to localStorage with timestamp:', answersWithTimestamp);
    }
    
    console.log('📝 Answers updated:', newAnswers);
  };

  const handlePassageChange = (passageNumber) => {
    setCurrentPassage(passageNumber);
    setQuestionData(null); // Clear current data when switching passages
  };

  console.log('🔍 QuestionView render state:', {
    selectedTest,
    loading,
    error,
    questionData: questionData ? 'has data' : 'no data'
  });

  if (!selectedTest) {
    console.log('❌ No selectedTest - showing placeholder');
    return <div className="question-area-placeholder">Please select a test to view questions</div>;
  }

  if (loading) {
    console.log('⏳ Loading questions...');
    return <div className="question-loading">Loading questions...</div>;
  }

  if (error) {
    console.log('❌ Error loading questions:', error);
    return <div className="question-error">Error: {error}</div>;
  }

  if (!questionData || !questionData.questionData) {
    console.log('❌ No question data available');
    return <div className="question-error">No question data available</div>;
  }

  // Render the appropriate question component based on the template type
  const renderQuestionComponent = () => {
    const { templates } = questionData.questionData;
    
    console.log('🎯 Rendering templates:', templates);
    
    if (!templates || templates.length === 0) {
      console.log('❌ No templates found');
      return <div>No question templates found</div>;
    }

    return templates.map((template, index) => {
      console.log('🎯 Rendering template:', template.questionType);
      
      switch (template.questionType) {
        case 'choose-x-word':
          return (
            <ChooseXWords
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
              testType={selectedTest.type}
            />
          );
        case 'TFNG':
          return (
            <TFNG
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
            />
          );
        case 'matching':
          return (
            <Matching
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
            />
          );
        case 'multiple-choice-two':
          return (
            <MultipleChoiceTwo
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
            />
          );
        case 'summary-completion':
          return (
            <SummaryCompletion
              key={index}
              template={template}
              onAnswerChange={handleAnswerChange}
            />
          );
        // TODO: Add other question types here
        default:
          return (
            <div key={index} className="unsupported-question-type">
              Unsupported question type: {template.questionType}
            </div>
          );
      }
    });
  };

  return (
    <div className="question-view-container">
      <div className="question-header">
        <div className="header-left">
          <h3>Questions</h3>
        </div>
        <div className="passage-toggle">
          <button 
            className={`passage-button ${currentPassage === 1 ? 'active' : ''}`}
            onClick={() => handlePassageChange(1)}
          >
            Passage 1
          </button>
          <button 
            className={`passage-button ${currentPassage === 2 ? 'active' : ''}`}
            onClick={() => handlePassageChange(2)}
          >
            Passage 2
          </button>
          <button 
            className={`passage-button ${currentPassage === 3 ? 'active' : ''}`}
            onClick={() => handlePassageChange(3)}
          >
            Passage 3
          </button>
        </div>
      </div>
      
      <div className="question-content">
        {renderQuestionComponent()}
      </div>
    </div>
  );
};

export default QuestionView; 
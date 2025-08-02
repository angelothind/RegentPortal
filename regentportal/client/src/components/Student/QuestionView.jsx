import React, { useState, useEffect } from 'react';
import ChooseXWords from '../Questions/ChooseXWords';

const QuestionView = ({ selectedTest }) => {
  console.log('🚀 QuestionView component mounted with selectedTest:', selectedTest);
  
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!selectedTest) {
        console.log('❌ No selectedTest provided to QuestionView');
        setQuestionData(null);
        return;
      }

      console.log('🔍 QuestionView: Fetching questions for:', selectedTest);
      setLoading(true);
      setError(null);

      try {
        // Fetch question data for part1 (initial part) with test type
        const endpoint = `/api/tests/${selectedTest.testId._id}/questions/part1?testType=${selectedTest.type}`;
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
  }, [selectedTest]);

  const handleAnswerChange = (answers) => {
    console.log('📝 Answers updated:', answers);
    // TODO: Save answers to backend or local state
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
            />
          );
        // TODO: Add other question types here
        // case 'TFNG':
        //   return <TFNG key={index} template={template} onAnswerChange={handleAnswerChange} />;
        // case 'matching':
        //   return <Matching key={index} template={template} onAnswerChange={handleAnswerChange} />;
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
        <h3>Questions - Part 1</h3>
        <p className="test-info">
          {questionData.title} - {selectedTest.type}
        </p>
      </div>
      
      <div className="question-content">
        {renderQuestionComponent()}
      </div>
    </div>
  );
};

export default QuestionView; 
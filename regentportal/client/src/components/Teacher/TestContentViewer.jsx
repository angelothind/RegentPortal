import React, { useState, useEffect } from 'react';
import '../../styles/UserLayout/TeacherDashboard.css';
import { processTextFormatting } from '../../utils/textFormatting';
import FlowchartCompletion from '../Questions/FlowchartCompletion';

const TestContentViewer = ({ selectedTest, testData }) => {
  const [currentPassage, setCurrentPassage] = useState(1);
  const [passageContent, setPassageContent] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPassageContent = async () => {
      if (!testData || !testData.sources || testData.sources.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        if (testData.sources.length > 0) {
          const currentSource = testData.sources[currentPassage - 1];
          
          if (currentSource && currentSource.content) {
            setPassageContent(currentSource.content);
          } else {
            const fetchUrl = `/assets/${currentSource.contentPath}`;
            const response = await fetch(fetchUrl);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setPassageContent(data);
          }
        }
      } catch (err) {
        console.error('❌ Failed to load passage content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPassageContent();
  }, [testData, currentPassage]);

  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!selectedTest) {
        setQuestionData(null);
        return;
      }

      console.log('🔍 TestContentViewer: Fetching questions for passage:', currentPassage);
      setLoading(true);
      try {
        const endpoint = `/api/tests/${selectedTest.testId._id}/questions/part${currentPassage}?testType=${selectedTest.type}`;
        console.log('📡 TestContentViewer: Calling endpoint:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 TestContentViewer: Received question data:', data);
        setQuestionData(data);
      } catch (error) {
        console.error('❌ Failed to fetch question data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [selectedTest, currentPassage]);

  const handlePassageChange = (passageNumber) => {
    setCurrentPassage(passageNumber);
    setPassageContent(null);
    setQuestionData(null);
  };

  if (loading) {
    return (
      <div className="test-content-viewer">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="test-content-viewer">
      <div className="content-header">
        <h3>Test Content</h3>
        <div className="passage-controls">
          {testData?.sources?.map((_, index) => (
            <button 
              key={index}
              onClick={() => handlePassageChange(index + 1)}
              className={currentPassage === index + 1 ? 'active' : ''}
            >
              Passage {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      <div className="content-sections">
        <div className="passage-section">
          <h4>Passage {currentPassage}</h4>
          {passageContent ? (
            <div className="passage-content">
              {passageContent.paragraphs?.map((paragraph, index) => (
                <div key={index} className="paragraph">
                  {paragraph.label && <strong>{paragraph.label}</strong>}
                  <p>{paragraph.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-content">No passage content available</div>
          )}
        </div>
        
        <div className="questions-section">
          <h4>Questions</h4>
          {questionData?.questionData?.templates ? (
            <div className="questions-content">
              {questionData.questionData.templates.map((template, index) => (
                <div key={index} className="question-template">
                  <h5>Question Type: {template.questionType}</h5>
                  <div className="template-details">
                    <p><strong>Instructions:</strong> <span dangerouslySetInnerHTML={{ 
                      __html: processTextFormatting(template.introInstruction) 
                    }} /></p>
                    <p><strong>Formatting:</strong> <span dangerouslySetInnerHTML={{ 
                      __html: processTextFormatting(template.formattingInstruction) 
                    }} /></p>
                    {template.questionBlock && (
                      <div className="question-block">
                        <strong>Questions:</strong>
                        <ul>
                          {template.questionBlock.map((question, qIndex) => (
                            <li key={qIndex}>
                              <strong>Q{question.questionNumber}:</strong> {question.question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-content">No questions available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestContentViewer; 
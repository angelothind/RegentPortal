import React, { useState, useEffect } from 'react';
import TestContentViewer from './TestContentViewer';
import StudentSubmissions from './StudentSubmissions';
import '../../styles/UserLayout/TeacherDashboard.css';
import API_BASE from '../../utils/api';

const TestManager = ({ selectedTest, user }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!selectedTest) {
        setTestData(null);
        return;
      }

      console.log('🔍 TestManager: Fetching test data for:', selectedTest);
      setLoading(true);
      try {
        // Fetch test data for current test
        const endpoint = `${API_BASE}/api/test/${selectedTest.testId._id}`;
        console.log('📡 TestManager: Calling endpoint:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 TestManager: Received test data:', data);
        setTestData(data);
      } catch (error) {
        console.error('❌ Failed to fetch test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [selectedTest]);

  if (!selectedTest) {
    return (
      <div className="test-manager-container">
        <div className="placeholder">
          <h2>Select a test to manage</h2>
          <p>Choose a test from the sidebar to view its content and student submissions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="test-manager-container">
        <div className="loading">Loading test data...</div>
      </div>
    );
  }

  return (
    <div className="test-manager-container">
      <div className="test-header">
        <h2>{selectedTest.title} - {selectedTest.type}</h2>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Test Content
          </button>
          <button 
            className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Student Submissions
          </button>
        </div>
      </div>
      
      <div className="test-content">
        {activeTab === 'content' && (
          <TestContentViewer selectedTest={selectedTest} testData={testData} />
        )}
        {activeTab === 'submissions' && (
          <StudentSubmissions selectedTest={selectedTest} />
        )}
      </div>
    </div>
  );
};

export default TestManager; 
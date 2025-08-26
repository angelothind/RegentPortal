import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/Student/StudentSidebar';
import TestViewer from '../components/Student/TestViewer';
import '../styles/UserLayout/StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);
  const [user, setUser] = useState(null);

  // Get user data from navigation state or localStorage
  useEffect(() => {
    const userData = navigate.state?.user;
    console.log('🔍 StudentDashboard received userData from navigate.state:', userData);
    
    if (userData) {
      setUser(userData);
    } else {
      // Fallback to localStorage if navigation state is not available
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 StudentDashboard using user data from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ Error parsing user data from localStorage:', error);
        }
      } else {
        console.log('❌ No user data found in navigation state or localStorage');
      }
    }
  }, [navigate]);

  const handleSelectTest = async (testInfo) => {
    console.log('🔍 StudentDashboard: handleSelectTest called with:', testInfo);
    setSelectedTest(testInfo);
    console.log('🔍 StudentDashboard: selectedTest state set to:', testInfo);
  };

  // Debug: Monitor selectedTest state changes
  useEffect(() => {
    console.log('🔍 StudentDashboard: selectedTest state changed to:', selectedTest);
  }, [selectedTest]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    console.log('🚪 Logout initiated...');
    setIsLoggingOut(true);
    
    try {
      // Remove beforeunload listeners to prevent navigation blocking
      console.log('🔒 Removing beforeunload listeners...');
      window.removeEventListener('beforeunload', () => {});
      
      console.log('🧹 Clearing user data...');
      localStorage.removeItem('user');
      
      // Clear any test-related data that might be causing delays
      console.log('🧹 Clearing test data...');
      if (selectedTest && selectedTest.testId) {
        const testKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}`;
        localStorage.removeItem(testKey);
        console.log('🧹 Removed test data:', testKey);
      }
      
      // Clear all test-related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('test-answers-')) {
          localStorage.removeItem(key);
          console.log('🧹 Removed test data:', key);
        }
      });
      
      console.log('🧹 All test data cleared');
      console.log('🚪 Navigating to home page...');
      
      // Small delay to ensure cleanup is visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      navigate('/');
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="student-dashboard">
      <StudentSidebar onSelectTest={handleSelectTest} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      
      {/* Logout Progress Indicator */}
      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-progress">
            <div className="logout-spinner"></div>
            <p>Logging out...</p>
            <p className="logout-details">Clearing test data and user session</p>
          </div>
        </div>
      )}
      
      <div className="main-content-area">
        {selectedTest && (
          <>
            {console.log('🔍 StudentDashboard passing to TestViewer:', { selectedTest, user })}
            <TestViewer selectedTest={selectedTest} user={user} />
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
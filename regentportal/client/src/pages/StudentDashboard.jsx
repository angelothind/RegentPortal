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
    console.log('Selected test:', testInfo);
    setSelectedTest(testInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/'); // or '/login' depending on your setup
  };

  return (
    <div className="student-dashboard">
      <StudentSidebar onSelectTest={handleSelectTest} onLogout={handleLogout} />
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
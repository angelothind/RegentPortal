import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/Student/StudentSidebar';
import TestViewer from '../components/Student/TestViewer';
import '../styles/UserLayout/StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);

  const handleSelectTest = async (testInfo) => {
    console.log('Selected test:', testInfo);

    try {
      const response = await fetch(`/api/tests/${testInfo.testId._id}`);
      const data = await response.json();
      console.log('Fetched test data:', data);
      setSelectedTest({ ...testInfo, testData: data });
    } catch (error) {
      console.error('Failed to fetch test data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/'); // or '/login' depending on your setup
  };

  return (
    <div className="student-dashboard">
      <StudentSidebar onSelectTest={handleSelectTest} onLogout={handleLogout} />
      <div className="main-content-area">
        {selectedTest && <TestViewer selectedTest={selectedTest} />}
      </div>
    </div>
  );
};

export default StudentDashboard;
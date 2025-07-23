import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/Student/StudentSidebar';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleSelectTest = (testName) => {
    console.log('Selected test:', testName);
    // TODO: Navigate or load test
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/'); // or '/login' depending on your setup
  };

  return (
    <div className="student-dashboard">
      <StudentSidebar onSelectTest={handleSelectTest} onLogout={handleLogout} />
    </div>
  );
};

export default StudentDashboard;
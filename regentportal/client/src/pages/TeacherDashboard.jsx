import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/Teacher/TeacherSidebar';
import TeacherStudentTable from '../components/Teacher/TeacherStudentTable';
import StudentDetails from '../components/Teacher/StudentDetails';
import '../styles/UserLayout/TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [user, setUser] = useState(null);

  // Get user data from navigation state or localStorage
  useEffect(() => {
    const userData = navigate.state?.user;
    console.log('🔍 TeacherDashboard received userData from navigate.state:', userData);
    
    if (userData) {
      setUser(userData);
    } else {
      // Fallback to localStorage if navigation state is not available
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 TeacherDashboard using user data from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ Error parsing user data from localStorage:', error);
        }
      } else {
        console.log('❌ No user data found in navigation state or localStorage');
      }
    }
  }, [navigate]);

  const handleStudentSelect = (student) => {
    console.log('Selected student for teacher view:', student);
    setSelectedStudent(student);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/'); // or '/login' depending on your setup
  };

  return (
    <div className="teacher-dashboard">
      <TeacherSidebar onLogout={handleLogout} />
      <div className="main-content-area">
        {selectedStudent ? (
          <StudentDetails 
            student={selectedStudent} 
            onBack={handleBackToStudents}
          />
        ) : (
          <TeacherStudentTable onStudentSelect={handleStudentSelect} />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

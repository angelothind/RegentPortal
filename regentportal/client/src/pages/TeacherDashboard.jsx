import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/Teacher/TeacherSidebar';
import TeacherStudentTable from '../components/Teacher/TeacherStudentTable';
import StudentDetails from '../components/Teacher/StudentDetails';
import TestViewer from '../components/Student/TestViewer';
import { clearResumeMarker } from '../utils/sessionExpiry';
import '../styles/UserLayout/TeacherDashboard.css';
import '../styles/UserLayout/StudentDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [user, setUser] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainContentRef = useRef(null);
  const dashboardRef = useRef(null);

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

  const handleSelectTest = (testInfo) => {
    setSelectedTest(testInfo);
  };

  const handleShowStudents = () => {
    setSelectedTest(null);
    setSelectedStudent(null);
  };

  const freezeOverlayLayout = useCallback(() => {
    dashboardRef.current?.setAttribute('data-overlay-instant', 'true');
  }, []);

  const scheduleOverlayTransitionRestore = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dashboardRef.current?.removeAttribute('data-overlay-instant');
      });
    });
  }, []);

  const requestElementFullscreen = useCallback(async (element) => {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    }
  }, []);

  const exitDocumentFullscreen = useCallback(async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isActive = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      freezeOverlayLayout();
      setIsFullscreen(isActive);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [freezeOverlayLayout]);

  useLayoutEffect(() => {
    if (dashboardRef.current?.hasAttribute('data-overlay-instant')) {
      scheduleOverlayTransitionRestore();
    }
  }, [isFullscreen, scheduleOverlayTransitionRestore]);

  useEffect(() => {
    if (!selectedTest && isFullscreen) {
      exitDocumentFullscreen().catch(() => {});
    }
  }, [selectedTest, isFullscreen, exitDocumentFullscreen]);

  const toggleFullscreen = async () => {
    const element = mainContentRef.current;
    if (!element) return;

    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await exitDocumentFullscreen();
      } else {
        freezeOverlayLayout();
        setIsFullscreen(true);
        await requestElementFullscreen(element);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('token');
    clearResumeMarker();

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('test-answers-')) {
        localStorage.removeItem(key);
      }
    });

    navigate('/');
  };

  console.log('🔍 TeacherDashboard render - selectedStudent:', selectedStudent);
  console.log('🔍 TeacherDashboard render - user:', user);
  return (
    <div className="teacher-dashboard" ref={dashboardRef}>
      <TeacherSidebar
        onSelectTest={handleSelectTest}
        onShowStudents={handleShowStudents}
        onLogout={handleLogout}
        hasSelectedTest={Boolean(selectedTest)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <div
        ref={mainContentRef}
        className={`main-content-area${isFullscreen ? ' fullscreen-mode' : ''}`}
      >
        {selectedTest ? (
          <TestViewer
            selectedTest={selectedTest}
            user={user}
            teacherPractice
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        ) : selectedStudent ? (
          <StudentDetails 
            student={selectedStudent} 
            onBack={handleBackToStudents}
          />
        ) : (
          <TeacherStudentTable onStudentSelect={handleStudentSelect} user={user} />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

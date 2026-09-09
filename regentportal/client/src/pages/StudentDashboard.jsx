import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
      const currentUserId = localStorage.getItem('currentUserId');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 StudentDashboard using user data from localStorage:', parsedUser);
          console.log('🔍 Current user ID from localStorage:', currentUserId);
          
          // CRITICAL FIX: Validate that the stored user matches the current user ID
          if (currentUserId && parsedUser._id !== currentUserId) {
            console.error('❌ SECURITY ISSUE: Stored user data does not match current user ID!');
            console.error('❌ Stored user ID:', parsedUser._id);
            console.error('❌ Current user ID:', currentUserId);
            console.error('❌ This could cause cross-user data leakage!');
            
            // Clear potentially corrupted user data
            localStorage.removeItem('user');
            localStorage.removeItem('currentUserId');
            alert('Security Error: User session mismatch detected. Please log in again.');
            navigate('/');
            return;
          }
          
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainContentRef = useRef(null);
  const dashboardRef = useRef(null);

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

  const handleLogout = async () => {
    console.log('🚪 Logout initiated...');
    setIsLoggingOut(true);
    
    try {
      // Remove beforeunload listeners to prevent navigation blocking
      console.log('🔒 Removing beforeunload listeners...');
      window.removeEventListener('beforeunload', () => {});
      
      console.log('🧹 Clearing user data...');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUserId');
      
      // Clear any test-related data that might be causing delays
      console.log('🧹 Clearing test data...');
      if (selectedTest && selectedTest.testId) {
        const testKey = `test-answers-${selectedTest.testId._id}-${selectedTest.type}-${user?._id || 'anonymous'}`;
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
    <div className="student-dashboard" ref={dashboardRef}>
      <StudentSidebar
        onSelectTest={handleSelectTest}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        hasSelectedTest={Boolean(selectedTest)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      
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
      
      <div
        ref={mainContentRef}
        className={`main-content-area${isFullscreen ? ' fullscreen-mode' : ''}`}
      >
        {selectedTest && (
          <>
            {console.log('🔍 StudentDashboard passing to TestViewer:', { selectedTest, user })}
            <TestViewer
              selectedTest={selectedTest}
              user={user}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
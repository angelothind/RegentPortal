import React, { useState } from 'react';
import '../../styles/UserLayout/SideBar.css';

const TeacherSidebar = ({ onLogout }) => {
  const [isShrunk, setIsShrunk] = useState(false);

  const toggleSidebar = () => {
    setIsShrunk(!isShrunk);
  };

  const handleLogout = () => {
    console.log('🚪 TeacherSidebar: Logging out');
    onLogout();
  };

  return (
    <div className={`sidebar ${isShrunk ? 'shrunk' : ''}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isShrunk ? '→' : '←'}
      </button>
      
      {!isShrunk && (
        <>
          <h2 className="sidebar-title">Teacher Portal</h2>
          
          <ul className="sidebar-nav">
            <li>
              <button className="selected">Students</button>
            </li>
            <li>
              <button className="logout" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default TeacherSidebar; 
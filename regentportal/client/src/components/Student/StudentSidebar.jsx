import React, { useState } from 'react';
import '../../styles/UserLayout/SideBar.css'; // Or create StudentSidebar.css

const StudentSidebar = ({ onSelectTest, onLogout }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const testItems = {
    Reading: ['Reading Test 1', 'Reading Test 2'],
    Listening: ['Listening Test 1', 'Listening Test 2'],
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Student Portal</h2>
      <ul className="sidebar-nav">
        {['Reading', 'Listening'].map((section) => (
          <li key={section}>
            <button onClick={() => toggleSection(section)}>
              {section}
            </button>

            {openSection === section && (
              <ul className="dropdown">
                {testItems[section].map((test, index) => (
                  <li key={index}>
                    <button onClick={() => onSelectTest(test)}>
                      {test}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}

        <li>
          <button className="logout" onClick={onLogout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default StudentSidebar;
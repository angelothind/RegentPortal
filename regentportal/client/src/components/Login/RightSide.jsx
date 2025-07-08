import React, { useState } from 'react';
import '../../styles/Login/RightSide.css';
import SelectionBox from './SelectionBox';
import LoginForm from './LoginForm'; // ✅ import here

const RightSide = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <div className="right-side">
      <div className="selection-boxes">
        {!selectedRole ? (
          <>
            <h2 className="welcome-text">Welcome to Regent Portal</h2>
            <SelectionBox message="Teacher" onClick={() => handleSelect('Teacher')} />
            <SelectionBox message="Student" onClick={() => handleSelect('Student')} />
          </>
        ) : (
          <LoginForm userType={selectedRole} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default RightSide;
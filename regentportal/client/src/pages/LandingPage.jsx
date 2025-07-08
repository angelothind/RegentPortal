import React from 'react';
import LeftSide from '../components/Login/LeftSide';
import RightSide from '../components/Login/RightSide';
import '../styles/Login/LeftRightDiv.css';

const LandingPage = () => {
  return (
    <div className="page-container">
      <LeftSide />
      <RightSide />
    </div>
  );
};

export default LandingPage;
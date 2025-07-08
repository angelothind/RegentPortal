import React from 'react';
import '../../styles/Login/LeftSide.css';
import RegentWhiteLogo from '../../assets/images/RegentWhiteLogo.png';

const LeftSide = () => {
  return (
    <div className="left-side">
      <img src={RegentWhiteLogo} alt="site logo" className="regent-logo" />
    </div>
  );
};

export default LeftSide;
import React from 'react';
import '../../styles/Login/SelectionBox.css';

function SelectionBox({ message, onClick }) {
  return (
    <button
      type="button"
      className="btn btn-primary select-btn"
      onClick={onClick}
    >
      {message}
    </button>
  );
}

export default SelectionBox;
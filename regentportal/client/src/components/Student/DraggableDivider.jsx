import React, { useState, useEffect } from 'react';

const DraggableDivider = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(0); // We'll calculate this from the parent
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const containerWidth = window.innerWidth - 234; // Account for sidebar
    const percentageChange = (deltaX / containerWidth) * 100;
    
    // Limit the resize to reasonable bounds (30% to 70%)
    const newPassageWidth = Math.max(30, Math.min(70, 56 + percentageChange));
    const newQuestionWidth = 100 - newPassageWidth;
    
    onResize(newPassageWidth, newQuestionWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX]);

  return (
    <div 
      className="draggable-divider"
      onMouseDown={handleMouseDown}
    />
  );
};

export default DraggableDivider; 
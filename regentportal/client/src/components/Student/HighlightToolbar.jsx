import React, { useEffect, useRef, useState } from 'react';
import '../../styles/UserLayout/TextHighlight.css';

const TOOLBAR_OFFSET = 8;
const COMMENT_PANEL_WIDTH = 240;
const COMMENT_PANEL_HEIGHT = 140;
const VIEWPORT_PADDING = 12;

const getFloatingPosition = (rect, width, height) => {
  let top = rect.top - height - TOOLBAR_OFFSET;
  if (top < VIEWPORT_PADDING) {
    top = rect.bottom + TOOLBAR_OFFSET;
  }

  let left = rect.left + rect.width / 2 - width / 2;
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING)
  );

  return { top, left };
};

const HighlightIcon = ({ crossed = false }) => (
  <svg className="highlight-toolbar-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    {crossed && (
      <>
        <path className="highlight-toolbar-icon-x" d="M5 5l14 14" />
        <path className="highlight-toolbar-icon-x" d="M19 5 5 19" />
      </>
    )}
  </svg>
);

const CommentIcon = () => (
  <svg className="highlight-toolbar-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const HighlightToolbar = ({
  position,
  selectionRect,
  onHighlight,
  onRemove,
  onAddComment,
  onCommentModeChange,
  onClose,
}) => {
  const toolbarRef = useRef(null);
  const commentInputRef = useRef(null);
  const [commentMode, setCommentMode] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (toolbarRef.current?.contains(event.target)) return;
      onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      onCommentModeChange(false);
    };
  }, [onCommentModeChange]);

  useEffect(() => {
    if (commentMode) {
      commentInputRef.current?.focus();
    }
  }, [commentMode]);

  if (!position) return null;

  const panelPosition =
    commentMode && selectionRect
      ? getFloatingPosition(
          selectionRect,
          COMMENT_PANEL_WIDTH,
          COMMENT_PANEL_HEIGHT
        )
      : position;

  const handleCommentClick = () => {
    setCommentMode(true);
    onCommentModeChange(true);
  };

  const handleCommentCancel = () => {
    setCommentMode(false);
    setCommentText('');
    onCommentModeChange(false);
  };

  const handleCommentSubmit = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onCommentModeChange(false);
    onAddComment(trimmed);
    setCommentMode(false);
    setCommentText('');
  };

  if (commentMode) {
    return (
      <div
        ref={toolbarRef}
        className="highlight-toolbar highlight-toolbar-comment-panel"
        style={{
          top: `${panelPosition.top}px`,
          left: `${panelPosition.left}px`,
        }}
        role="dialog"
        aria-label="Add comment to highlight"
      >
        <textarea
          ref={commentInputRef}
          className="highlight-toolbar-comment-input"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Write a comment..."
          rows={3}
        />
        <div className="highlight-toolbar-comment-actions">
          <button
            type="button"
            className="highlight-toolbar-comment-cancel"
            onClick={handleCommentCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="highlight-toolbar-comment-add"
            onClick={handleCommentSubmit}
            disabled={!commentText.trim()}
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={toolbarRef}
      className="highlight-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="toolbar"
      aria-label="Text highlight options"
    >
      <button
        type="button"
        className="highlight-toolbar-button"
        onClick={onHighlight}
        aria-label="Highlight"
        title="Highlight"
      >
        <HighlightIcon />
      </button>
      <button
        type="button"
        className="highlight-toolbar-button remove"
        onClick={onRemove}
        aria-label="Remove highlight"
        title="Remove highlight"
      >
        <HighlightIcon crossed />
      </button>
      <button
        type="button"
        className="highlight-toolbar-button comment"
        onClick={handleCommentClick}
        aria-label="Add comment"
        title="Add comment"
      >
        <CommentIcon />
      </button>
    </div>
  );
};

export default HighlightToolbar;

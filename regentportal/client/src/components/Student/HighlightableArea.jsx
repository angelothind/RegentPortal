import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useHighlight } from '../../contexts/HighlightContext';
import {
  applyCssHighlights,
  applyHoverHighlight,
  applyPreviewHighlight,
  clearCssHighlights,
  clearHoverHighlight,
  clearPreviewHighlight,
  clickToCharacterOffset,
  findCommentedRangeAtOffset,
  getRangeClientRect,
  isCssHighlightSupported,
  isValidHighlightSelection,
  rangeToCharacterOffsets,
} from '../../utils/textHighlightUtils';
import HighlightToolbar from './HighlightToolbar';
import '../../styles/UserLayout/TextHighlight.css';

const TOOLBAR_OFFSET = 8;
const TOOLBAR_WIDTH = 108;
const TOOLBAR_HEIGHT = 44;
const COMMENT_PANEL_WIDTH = 240;
const COMMENT_PANEL_HEIGHT = 140;
const VIEWPORT_PADDING = 12;
const COMMENT_MARKER_SIZE = 30;
const COMMENT_MARKER_OFFSET = 11;
const COMMENT_MARKER_RIGHT_GAP = 6;
const EMPTY_HIGHLIGHTS = [];

const markersEqual = (left, right) => {
  if (left.length !== right.length) return false;
  return left.every(
    (marker, index) =>
      marker.id === right[index].id &&
      marker.top === right[index].top &&
      marker.left === right[index].left &&
      marker.comment === right[index].comment
  );
};

const CommentMarkerIcon = () => (
  <svg className="highlight-comment-marker-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

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

const HighlightableArea = ({ regionId, children, className = '' }) => {
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const {
    addHighlight,
    addCommentHighlight,
    removeHighlight,
    removeCommentHighlight,
    highlights,
  } = useHighlight();
  const [toolbarState, setToolbarState] = useState(null);
  const [commentModeActive, setCommentModeActive] = useState(false);
  const [commentMarkers, setCommentMarkers] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const [isHoveringCommentedRange, setIsHoveringCommentedRange] = useState(false);
  const hoveredCommentIdRef = useRef(null);

  const regionHighlights = useMemo(() => {
    const regionRanges = highlights[regionId];
    return Array.isArray(regionRanges) ? regionRanges : EMPTY_HIGHLIGHTS;
  }, [highlights, regionId]);

  const clearBrowserSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  const closeToolbar = useCallback(() => {
    setCommentModeActive(false);
    setToolbarState(null);
    clearBrowserSelection();
    clearPreviewHighlight(regionId);
  }, [clearBrowserSelection, regionId]);

  const closeCommentPopover = useCallback(() => {
    setActiveComment(null);
  }, []);

  const clearCommentHover = useCallback(() => {
    hoveredCommentIdRef.current = null;
    clearHoverHighlight(regionId);
    setIsHoveringCommentedRange(false);
  }, [regionId]);

  const getToolbarPosition = useCallback((rect, isCommentPanel = false) => {
    const width = isCommentPanel ? COMMENT_PANEL_WIDTH : TOOLBAR_WIDTH;
    const height = isCommentPanel ? COMMENT_PANEL_HEIGHT : TOOLBAR_HEIGHT;
    return getFloatingPosition(rect, width, height);
  }, []);

  const updateCommentMarkers = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setCommentMarkers((prev) => (prev.length ? [] : prev));
      return;
    }

    const commentedRanges = regionHighlights.filter((range) => range.comment && range.id);
    const nextMarkers = commentedRanges
      .map((range) => {
        const rect = getRangeClientRect(container, range.start, range.end);
        if (!rect) return null;

        return {
          id: range.id,
          comment: range.comment,
          top: rect.top - COMMENT_MARKER_OFFSET,
          left: rect.right + COMMENT_MARKER_RIGHT_GAP,
        };
      })
      .filter(Boolean);

    setCommentMarkers((prev) => (markersEqual(prev, nextMarkers) ? prev : nextMarkers));
  }, [regionHighlights]);

  const updateFloatingUiPositions = useCallback(() => {
    updateCommentMarkers();

    setToolbarState((prev) => {
      if (!prev?.range) return prev;

      const container = containerRef.current;
      if (!container) return prev;

      const rect = getRangeClientRect(container, prev.range.start, prev.range.end);
      if (!rect) return prev;

      const position = getToolbarPosition(rect);
      const selectionRect = {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };

      if (
        prev.position.top === position.top &&
        prev.position.left === position.left &&
        prev.selectionRect?.top === selectionRect.top &&
        prev.selectionRect?.left === selectionRect.left
      ) {
        return prev;
      }

      return {
        ...prev,
        position,
        selectionRect,
      };
    });

    setActiveComment((prev) => {
      if (!prev?.id) return prev;

      const container = containerRef.current;
      const range = regionHighlights.find((item) => item.id === prev.id);
      if (!container || !range) return prev;

      const rect = getRangeClientRect(container, range.start, range.end);
      if (!rect) return prev;

      const position = getFloatingPosition(rect, 260, 120);
      if (
        prev.position.top === position.top &&
        prev.position.left === position.left
      ) {
        return prev;
      }

      return { ...prev, position };
    });
  }, [getToolbarPosition, regionHighlights, updateCommentMarkers]);

  const openCommentPopover = useCallback((range, anchorRect) => {
    const rect =
      anchorRect ||
      getRangeClientRect(containerRef.current, range.start, range.end);

    if (!rect) return;

    const popoverWidth = 260;
    const popoverHeight = 120;
    const position = getFloatingPosition(rect, popoverWidth, popoverHeight);

    setActiveComment({
      id: range.id,
      comment: range.comment,
      position,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isCssHighlightSupported()) return;

    const container = containerRef.current;
    const selection = window.getSelection();

    if (!container || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!isValidHighlightSelection(container, range)) {
      setToolbarState(null);
      return;
    }

    const offsets = rangeToCharacterOffsets(container, range);
    if (!offsets) {
      setToolbarState(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setToolbarState(null);
      return;
    }

    closeCommentPopover();
    setToolbarState({
      position: getToolbarPosition(rect),
      selectionRect: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
      range: offsets,
    });
  }, [closeCommentPopover, getToolbarPosition]);

  const handleHighlight = useCallback(() => {
    if (!toolbarState?.range) return;
    addHighlight(regionId, toolbarState.range.start, toolbarState.range.end);
    closeToolbar();
  }, [addHighlight, closeToolbar, regionId, toolbarState]);

  const handleRemove = useCallback(() => {
    if (!toolbarState?.range) return;
    removeHighlight(regionId, toolbarState.range.start, toolbarState.range.end);
    closeToolbar();
  }, [closeToolbar, removeHighlight, regionId, toolbarState]);

  const handleAddComment = useCallback(
    (comment) => {
      if (!toolbarState?.range) return;
      addCommentHighlight(
        regionId,
        toolbarState.range.start,
        toolbarState.range.end,
        comment
      );
      closeToolbar();
    },
    [addCommentHighlight, closeToolbar, regionId, toolbarState]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!isCssHighlightSupported()) return;

      if (toolbarState) {
        if (hoveredCommentIdRef.current) {
          clearCommentHover();
        }
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const offset = clickToCharacterOffset(container, event.clientX, event.clientY);
      const commentedRange = findCommentedRangeAtOffset(regionHighlights, offset);

      if (!commentedRange) {
        if (hoveredCommentIdRef.current) {
          clearCommentHover();
        }
        return;
      }

      setIsHoveringCommentedRange(true);

      if (hoveredCommentIdRef.current === commentedRange.id) return;

      hoveredCommentIdRef.current = commentedRange.id;
      applyHoverHighlight(container, regionId, commentedRange.start, commentedRange.end);
    },
    [clearCommentHover, regionHighlights, regionId, toolbarState]
  );

  const handlePointerLeave = useCallback(() => {
    clearCommentHover();
  }, [clearCommentHover]);

  const handleContainerClick = useCallback(
    (event) => {
      if (!isCssHighlightSupported()) return;
      if (toolbarState) return;

      const container = containerRef.current;
      const selection = window.getSelection();
      if (!container || (selection && !selection.isCollapsed)) return;

      const offset = clickToCharacterOffset(container, event.clientX, event.clientY);
      if (offset === null) return;

      const commentedRange = findCommentedRangeAtOffset(regionHighlights, offset);
      if (!commentedRange) return;

      event.preventDefault();
      openCommentPopover(commentedRange);
    },
    [openCommentPopover, regionHighlights, toolbarState]
  );

  const handleMarkerClick = useCallback(
    (event, marker) => {
      event.preventDefault();
      event.stopPropagation();

      const range = regionHighlights.find((item) => item.id === marker.id);
      if (!range) return;

      openCommentPopover(range, {
        top: marker.top,
        left: marker.left,
        right: marker.left + COMMENT_MARKER_SIZE,
        bottom: marker.top + COMMENT_MARKER_SIZE,
        width: COMMENT_MARKER_SIZE,
        height: COMMENT_MARKER_SIZE,
      });
    },
    [openCommentPopover, regionHighlights]
  );

  const handleDeleteComment = useCallback(() => {
    if (!activeComment?.id) return;
    removeCommentHighlight(regionId, activeComment.id);
    closeCommentPopover();
  }, [activeComment, closeCommentPopover, regionId, removeCommentHighlight]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !isCssHighlightSupported()) return undefined;

    try {
      applyCssHighlights(container, regionId, regionHighlights);
    } catch (error) {
      console.error('Failed to apply CSS highlights:', error);
    }

    const hoveredId = hoveredCommentIdRef.current;
    if (hoveredId) {
      const hoveredRange = regionHighlights.find((range) => range.id === hoveredId);
      if (hoveredRange) {
        applyHoverHighlight(container, regionId, hoveredRange.start, hoveredRange.end);
      } else {
        hoveredCommentIdRef.current = null;
        setIsHoveringCommentedRange(false);
      }
    }

    return () => {
      clearCssHighlights(regionId);
    };
  }, [regionId, regionHighlights]);

  useEffect(() => {
    if (toolbarState) {
      clearCommentHover();
    }
  }, [clearCommentHover, toolbarState]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !isCssHighlightSupported()) return undefined;

    if (toolbarState?.range && commentModeActive) {
      try {
        applyPreviewHighlight(
          container,
          regionId,
          toolbarState.range.start,
          toolbarState.range.end
        );
      } catch (error) {
        console.error('Failed to apply preview highlight:', error);
      }
    } else {
      clearPreviewHighlight(regionId);
    }

    return () => {
      clearPreviewHighlight(regionId);
    };
  }, [commentModeActive, regionId, toolbarState]);

  useLayoutEffect(() => {
    updateFloatingUiPositions();
  }, [updateFloatingUiPositions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      updateFloatingUiPositions();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateFloatingUiPositions]);

  useEffect(() => {
    const handleScrollOrResize = () => {
      updateFloatingUiPositions();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [updateFloatingUiPositions]);

  useEffect(() => {
    if (!activeComment) return undefined;

    const handleMouseDown = (event) => {
      if (popoverRef.current?.contains(event.target)) return;
      closeCommentPopover();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCommentPopover();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeComment, closeCommentPopover]);

  return (
    <>
      <div
        ref={containerRef}
        className={`highlightable-area ${className}`.trim()}
        style={isHoveringCommentedRange ? { cursor: 'pointer' } : undefined}
        onMouseUp={handleMouseUp}
        onClick={handleContainerClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {children}
      </div>

      {commentMarkers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          className="highlight-comment-marker"
          style={{
            top: `${marker.top}px`,
            left: `${marker.left}px`,
          }}
          onClick={(event) => handleMarkerClick(event, marker)}
          aria-label="View highlight comment"
          title="View comment"
        >
          <CommentMarkerIcon />
        </button>
      ))}

      {toolbarState && (
        <HighlightToolbar
          position={toolbarState.position}
          selectionRect={toolbarState.selectionRect}
          onHighlight={handleHighlight}
          onRemove={handleRemove}
          onAddComment={handleAddComment}
          onCommentModeChange={setCommentModeActive}
          onClose={closeToolbar}
        />
      )}

      {activeComment && (
        <div
          ref={popoverRef}
          className="highlight-comment-popover"
          style={{
            top: `${activeComment.position.top}px`,
            left: `${activeComment.position.left}px`,
          }}
          role="dialog"
          aria-label="Highlight comment"
        >
          <p className="highlight-comment-popover-text">{activeComment.comment}</p>
          <div className="highlight-comment-popover-actions">
            <button
              type="button"
              className="highlight-comment-popover-delete"
              onClick={handleDeleteComment}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HighlightableArea;

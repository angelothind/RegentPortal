const EXCLUDED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);
const HIGHLIGHT_STYLE_ID_PREFIX = 'highlight-style-';

export const isCssHighlightSupported = () =>
  typeof CSS !== 'undefined' &&
  'highlights' in CSS &&
  typeof Highlight !== 'undefined';

export const getHighlightName = (regionId) => `user-text-highlight-${regionId}`;

export const getCommentHighlightName = (regionId) =>
  `user-text-highlight-comment-${regionId}`;

export const getPreviewHighlightName = (regionId) =>
  `user-text-highlight-preview-${regionId}`;

export const getHoverHighlightName = (regionId) =>
  `user-text-highlight-hover-${regionId}`;

export const createHighlightId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `hl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const hasCommentMetadata = (range) => Boolean(range?.comment || range?.id);

const isInsideExcluded = (node, container) => {
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== container) {
    if (EXCLUDED_TAGS.has(el.tagName)) return true;
    if (el.classList?.contains('highlight-toolbar')) return true;
    if (el.classList?.contains('highlight-comment-marker')) return true;
    if (el.classList?.contains('highlight-comment-popover')) return true;
    if (el.classList?.contains('inline-correction')) return true;
    el = el.parentElement;
  }
  return false;
};

export const getTextNodeSegments = (container) => {
  if (!container) return [];

  const segments = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent) return NodeFilter.FILTER_REJECT;
      if (isInsideExcluded(node, container)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let offset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const length = node.textContent.length;
    segments.push({ node, start: offset, end: offset + length });
    offset += length;
  }

  return segments;
};

const rangeIntersectsSegment = (segment, selectionRange) => {
  try {
    const segmentRange = document.createRange();
    segmentRange.selectNodeContents(segment.node);

    return (
      selectionRange.compareBoundaryPoints(Range.END_TO_START, segmentRange) < 0 &&
      selectionRange.compareBoundaryPoints(Range.START_TO_END, segmentRange) > 0
    );
  } catch {
    return false;
  }
};

const getSegmentIntersection = (segment, selectionRange) => {
  if (!rangeIntersectsSegment(segment, selectionRange)) return null;

  try {
    const segmentRange = document.createRange();
    segmentRange.selectNodeContents(segment.node);

    const intersectRange = document.createRange();

    if (selectionRange.compareBoundaryPoints(Range.START_TO_START, segmentRange) >= 0) {
      intersectRange.setStart(selectionRange.startContainer, selectionRange.startOffset);
    } else {
      intersectRange.setStart(segment.node, 0);
    }

    if (selectionRange.compareBoundaryPoints(Range.END_TO_END, segmentRange) <= 0) {
      intersectRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
    } else {
      intersectRange.setEnd(segment.node, segment.node.textContent.length);
    }

    if (intersectRange.collapsed) return null;

    const sliceStart =
      intersectRange.startContainer === segment.node ? intersectRange.startOffset : 0;
    const sliceEnd =
      intersectRange.endContainer === segment.node
        ? intersectRange.endOffset
        : segment.node.textContent.length;

    if (sliceEnd <= sliceStart) return null;

    return {
      start: segment.start + sliceStart,
      end: segment.start + sliceEnd,
    };
  } catch {
    return null;
  }
};

export const rangeToCharacterOffsets = (container, range) => {
  if (!container || !range) return null;

  const segments = getTextNodeSegments(container);
  if (!segments.length) return null;

  let minStart = Infinity;
  let maxEnd = -Infinity;

  for (const segment of segments) {
    const intersection = getSegmentIntersection(segment, range);
    if (!intersection) continue;

    minStart = Math.min(minStart, intersection.start);
    maxEnd = Math.max(maxEnd, intersection.end);
  }

  if (!Number.isFinite(minStart) || maxEnd <= minStart) return null;

  return { start: minStart, end: maxEnd };
};

export const characterOffsetsToRanges = (container, start, end) => {
  if (!container || start >= end) return [];

  const segments = getTextNodeSegments(container);
  const ranges = [];

  for (const segment of segments) {
    const sliceStart = Math.max(start, segment.start);
    const sliceEnd = Math.min(end, segment.end);
    if (sliceStart >= sliceEnd) continue;

    try {
      const range = document.createRange();
      range.setStart(segment.node, sliceStart - segment.start);
      range.setEnd(segment.node, sliceEnd - segment.start);
      ranges.push(range);
    } catch {
      // Skip invalid range slices.
    }
  }

  return ranges;
};

export const isValidHighlightSelection = (container, range) => {
  if (!container || !range || range.collapsed) return false;

  const commonAncestor = range.commonAncestorContainer;
  const ancestorElement =
    commonAncestor.nodeType === Node.TEXT_NODE
      ? commonAncestor.parentElement
      : commonAncestor;

  if (!ancestorElement || !container.contains(ancestorElement)) return false;

  return rangeToCharacterOffsets(container, range) !== null;
};

export const mergeRanges = (ranges) => {
  if (!ranges?.length) return [];

  const sorted = [...ranges]
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start);

  if (!sorted.length) return [];

  const merged = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (
      !hasCommentMetadata(current) &&
      !hasCommentMetadata(last) &&
      current.start <= last.end
    ) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
};

export const removeOverlappingRanges = (ranges, removeStart, removeEnd) => {
  if (!ranges?.length) return [];

  const result = [];

  for (const range of ranges) {
    if (range.end <= removeStart || range.start >= removeEnd) {
      result.push({ ...range });
      continue;
    }

    const fragments = [];

    if (range.start < removeStart) {
      fragments.push({ start: range.start, end: removeStart });
    }

    if (range.end > removeEnd) {
      fragments.push({ start: removeEnd, end: range.end });
    }

    if (hasCommentMetadata(range) && fragments.length) {
      const [firstFragment, ...restFragments] = fragments;
      result.push({
        ...firstFragment,
        id: range.id,
        comment: range.comment,
      });
      restFragments.forEach((fragment) => result.push(fragment));
    } else {
      fragments.forEach((fragment) => result.push(fragment));
    }
  }

  return mergeRanges(result.filter((rangeItem) => rangeItem.end > rangeItem.start));
};

export const findCommentedRangeAtOffset = (ranges, offset) => {
  if (!ranges?.length || !Number.isFinite(offset)) return null;

  return (
    ranges.find(
      (range) =>
        range.comment &&
        offset >= range.start &&
        offset < range.end
    ) || null
  );
};

export const getRangeClientRect = (container, start, end) => {
  const domRanges = characterOffsetsToRanges(container, start, end);
  if (!domRanges.length) return null;

  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const domRange of domRanges) {
    const rects = domRange.getClientRects();
    for (const rect of rects) {
      if (!rect.width && !rect.height) continue;
      top = Math.min(top, rect.top);
      left = Math.min(left, rect.left);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
  }

  if (!Number.isFinite(top)) return null;

  return {
    top,
    left,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
};

export const clickToCharacterOffset = (container, clientX, clientY) => {
  if (!container) return null;

  const doc = container.ownerDocument;
  let range = null;

  if (typeof doc.caretRangeFromPoint === 'function') {
    range = doc.caretRangeFromPoint(clientX, clientY);
  } else if (typeof doc.caretPositionFromPoint === 'function') {
    const position = doc.caretPositionFromPoint(clientX, clientY);
    if (position) {
      range = doc.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  }

  if (!range) return null;

  const commonAncestor = range.commonAncestorContainer;
  const ancestorElement =
    commonAncestor.nodeType === Node.TEXT_NODE
      ? commonAncestor.parentElement
      : commonAncestor;

  if (!ancestorElement || !container.contains(ancestorElement)) return null;

  const segments = getTextNodeSegments(container);
  const startContainer = range.startContainer;
  const startOffset = range.startOffset;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const segment = segments.find((item) => item.node === startContainer);
    if (segment) {
      return segment.start + startOffset;
    }
  }

  return null;
};

export const ensureHighlightStyle = (highlightName) => {
  const styleId = `${HIGHLIGHT_STYLE_ID_PREFIX}${highlightName}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    ::highlight(${highlightName}) {
      background-color: rgba(255, 235, 59, 0.65);
      color: inherit;
    }
  `;
  document.head.appendChild(style);
};

export const ensureCommentHighlightStyle = (highlightName) => {
  const styleId = `${HIGHLIGHT_STYLE_ID_PREFIX}${highlightName}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    ::highlight(${highlightName}) {
      background-color: rgba(255, 193, 7, 0.75);
      color: inherit;
    }
  `;
  document.head.appendChild(style);
};

export const ensurePreviewHighlightStyle = (highlightName) => {
  const styleId = `${HIGHLIGHT_STYLE_ID_PREFIX}${highlightName}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    ::highlight(${highlightName}) {
      background-color: rgba(255, 193, 7, 0.75);
      color: inherit;
    }
  `;
  document.head.appendChild(style);
};

export const ensureHoverHighlightStyle = (highlightName) => {
  const styleId = `${HIGHLIGHT_STYLE_ID_PREFIX}${highlightName}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    ::highlight(${highlightName}) {
      background-color: rgba(255, 143, 0, 0.9);
      color: inherit;
    }
  `;
  document.head.appendChild(style);
};

const setHighlightRegistry = (highlightName, domRanges, priority = 0) => {
  try {
    if (!domRanges.length) {
      CSS.highlights.delete(highlightName);
      return;
    }

    const highlight = new Highlight(...domRanges);
    highlight.priority = priority;
    CSS.highlights.set(highlightName, highlight);
  } catch (error) {
    console.error(`Failed to set highlight registry for ${highlightName}:`, error);
    CSS.highlights.delete(highlightName);
  }
};

const normalizeHighlightRanges = (ranges) => {
  if (!Array.isArray(ranges)) return [];

  return ranges.filter(
    (range) =>
      range &&
      Number.isFinite(range.start) &&
      Number.isFinite(range.end) &&
      range.end > range.start
  );
};

export const applyCssHighlights = (container, regionId, ranges) => {
  if (!isCssHighlightSupported() || !container) return false;

  const highlightName = getHighlightName(regionId);
  const commentHighlightName = getCommentHighlightName(regionId);
  ensureHighlightStyle(highlightName);
  ensureCommentHighlightStyle(commentHighlightName);

  const normalizedRanges = normalizeHighlightRanges(ranges);
  const plainRanges = normalizedRanges.filter((range) => !range.comment);
  const commentRanges = normalizedRanges.filter((range) => range.comment);

  const plainDomRanges = plainRanges.flatMap(({ start, end }) =>
    characterOffsetsToRanges(container, start, end)
  );
  const commentDomRanges = commentRanges.flatMap(({ start, end }) =>
    characterOffsetsToRanges(container, start, end)
  );

  setHighlightRegistry(highlightName, plainDomRanges);
  setHighlightRegistry(commentHighlightName, commentDomRanges);
  return true;
};

export const applyPreviewHighlight = (container, regionId, start, end) => {
  if (!isCssHighlightSupported() || !container || start >= end) return false;

  const highlightName = getPreviewHighlightName(regionId);
  ensurePreviewHighlightStyle(highlightName);

  const domRanges = characterOffsetsToRanges(container, start, end);
  setHighlightRegistry(highlightName, domRanges);
  return true;
};

export const clearPreviewHighlight = (regionId) => {
  if (!isCssHighlightSupported()) return;
  CSS.highlights.delete(getPreviewHighlightName(regionId));
};

export const applyHoverHighlight = (container, regionId, start, end) => {
  if (!isCssHighlightSupported() || !container || start >= end) return false;

  const highlightName = getHoverHighlightName(regionId);
  ensureHoverHighlightStyle(highlightName);

  const domRanges = characterOffsetsToRanges(container, start, end);
  setHighlightRegistry(highlightName, domRanges, 1);
  return Boolean(domRanges.length);
};

export const clearHoverHighlight = (regionId) => {
  if (!isCssHighlightSupported()) return;
  CSS.highlights.delete(getHoverHighlightName(regionId));
};

export const clearCssHighlights = (regionId) => {
  if (!isCssHighlightSupported()) return;
  CSS.highlights.delete(getHighlightName(regionId));
  CSS.highlights.delete(getCommentHighlightName(regionId));
  CSS.highlights.delete(getPreviewHighlightName(regionId));
  CSS.highlights.delete(getHoverHighlightName(regionId));
};

export const getStorageKey = (testId, testType, userId) =>
  `test-answers-${testId}-${testType}-${userId || 'anonymous'}`;

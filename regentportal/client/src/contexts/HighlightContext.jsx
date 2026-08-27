import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createHighlightId,
  getStorageKey,
  mergeRanges,
  removeOverlappingRanges,
} from '../utils/textHighlightUtils';
import { isSessionExpired } from '../utils/testSessionUtils';

const normalizeHighlightsState = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((acc, [regionId, ranges]) => {
    if (!Array.isArray(ranges)) return acc;

    const normalizedRanges = ranges.filter(
      (range) =>
        range &&
        Number.isFinite(range.start) &&
        Number.isFinite(range.end) &&
        range.end > range.start
    );

    if (normalizedRanges.length) {
      acc[regionId] = normalizedRanges;
    }

    return acc;
  }, {});
};

const HighlightContext = createContext(null);

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};

export const HighlightProvider = ({
  children,
  testId,
  testType,
  userId,
  persist = true,
}) => {
  const [highlights, setHighlights] = useState({});
  const saveTimeoutRef = useRef(null);
  const loadedKeyRef = useRef(null);

  const storageKey = useMemo(() => {
    if (!testId || !testType || !persist) return null;
    return getStorageKey(testId, testType, userId);
  }, [testId, testType, userId, persist]);

  const saveHighlights = useCallback(
    (nextHighlights) => {
      if (!storageKey) return;

      const existingRaw = localStorage.getItem(storageKey);
      let existingData = {};

      if (existingRaw) {
        try {
          existingData = JSON.parse(existingRaw);
        } catch {
          existingData = {};
        }
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...existingData,
          _highlights: nextHighlights,
          _timestamp: Date.now(),
        })
      );
    },
    [storageKey]
  );

  const scheduleSave = useCallback(
    (nextHighlights) => {
      if (!storageKey) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveHighlights(nextHighlights);
      }, 300);
    },
    [saveHighlights, storageKey]
  );

  useEffect(() => {
    if (!storageKey) {
      setHighlights({});
      loadedKeyRef.current = null;
      return undefined;
    }

    if (loadedKeyRef.current === storageKey) return undefined;

    loadedKeyRef.current = storageKey;

    const savedRaw = localStorage.getItem(storageKey);
    if (!savedRaw) {
      setHighlights({});
      return undefined;
    }

    try {
      const parsed = JSON.parse(savedRaw);

      if (isSessionExpired(parsed._timestamp)) {
        setHighlights({});
        const { _highlights, ...rest } = parsed;
        localStorage.setItem(storageKey, JSON.stringify(rest));
        return undefined;
      }

      setHighlights(
        normalizeHighlightsState(parsed._highlights)
      );
    } catch {
      setHighlights({});
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [storageKey]);

  const addHighlight = useCallback(
    (regionId, start, end) => {
      if (!regionId || start >= end) return;

      setHighlights((prev) => {
        const regionRanges = prev[regionId] || [];
        const next = {
          ...prev,
          [regionId]: mergeRanges([...regionRanges, { start, end }]),
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const removeHighlight = useCallback(
    (regionId, start, end) => {
      if (!regionId || start >= end) return;

      setHighlights((prev) => {
        const regionRanges = prev[regionId] || [];
        const updatedRegion = removeOverlappingRanges(regionRanges, start, end);
        const next = { ...prev };

        if (updatedRegion.length) {
          next[regionId] = updatedRegion;
        } else {
          delete next[regionId];
        }

        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const addCommentHighlight = useCallback(
    (regionId, start, end, comment) => {
      const trimmedComment = comment?.trim();
      if (!regionId || start >= end || !trimmedComment) return;

      setHighlights((prev) => {
        const regionRanges = prev[regionId] || [];
        const next = {
          ...prev,
          [regionId]: [
            ...regionRanges,
            {
              start,
              end,
              id: createHighlightId(),
              comment: trimmedComment,
            },
          ],
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const removeCommentHighlight = useCallback(
    (regionId, id) => {
      if (!regionId || !id) return;

      setHighlights((prev) => {
        const regionRanges = prev[regionId] || [];
        const updatedRegion = regionRanges.filter((range) => range.id !== id);
        const next = { ...prev };

        if (updatedRegion.length) {
          next[regionId] = updatedRegion;
        } else {
          delete next[regionId];
        }

        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const clearHighlights = useCallback(() => {
    setHighlights({});
    if (storageKey) {
      const existingRaw = localStorage.getItem(storageKey);
      if (existingRaw) {
        try {
          const existingData = JSON.parse(existingRaw);
          const { _highlights, ...rest } = existingData;
          localStorage.setItem(
            storageKey,
            JSON.stringify({ ...rest, _timestamp: Date.now() })
          );
        } catch {
          // Ignore malformed storage entries.
        }
      }
    }
  }, [storageKey]);

  const getRegionHighlights = useCallback(
    (regionId) => highlights[regionId] || [],
    [highlights]
  );

  const value = useMemo(
    () => ({
      highlights,
      addHighlight,
      addCommentHighlight,
      removeHighlight,
      removeCommentHighlight,
      clearHighlights,
      getRegionHighlights,
    }),
    [
      highlights,
      addHighlight,
      addCommentHighlight,
      removeHighlight,
      removeCommentHighlight,
      clearHighlights,
      getRegionHighlights,
    ]
  );

  return (
    <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>
  );
};

export default HighlightContext;

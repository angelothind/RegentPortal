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
  normalizeHighlightsState,
  removeOverlappingRanges,
} from '../utils/textHighlightUtils';
import { isSessionExpired } from '../utils/testSessionUtils';
import {
  clearHighlightsFromSession,
  loadTestSession,
  saveTestSession,
} from '../utils/testSessionStorage';

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
  readOnly: readOnlyProp = false,
  initialHighlights = null,
}) => {
  const [highlights, setHighlights] = useState(() =>
    normalizeHighlightsState(initialHighlights)
  );
  const [readOnlyState, setReadOnlyState] = useState(Boolean(readOnlyProp));
  const saveTimeoutRef = useRef(null);
  const loadedKeyRef = useRef(null);
  const readOnlyRef = useRef(Boolean(readOnlyProp));

  const readOnly = Boolean(readOnlyProp || readOnlyState);

  useEffect(() => {
    readOnlyRef.current = readOnly;
  }, [readOnly]);

  const storageKey = useMemo(() => {
    if (!testId || !testType || !persist) return null;
    return getStorageKey(testId, testType, userId);
  }, [testId, testType, userId, persist]);

  const saveHighlights = useCallback(
    (nextHighlights) => {
      if (!storageKey) return;

      saveTestSession(storageKey, {
        _highlights: nextHighlights,
        _timestamp: Date.now(),
      });
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

  const initialHighlightsSignature = useMemo(
    () => JSON.stringify(initialHighlights || {}),
    [initialHighlights]
  );

  const normalizedInitialHighlights = useMemo(
    () => normalizeHighlightsState(initialHighlights),
    // Keyed on the content signature because callers routinely pass a fresh
    // object literal on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialHighlightsSignature]
  );

  useEffect(() => {
    setReadOnlyState(Boolean(readOnlyProp));
  }, [readOnlyProp]);

  useEffect(() => {
    if (persist) return;
    setHighlights(normalizedInitialHighlights);
  }, [persist, normalizedInitialHighlights]);

  useEffect(() => {
    if (!storageKey) {
      loadedKeyRef.current = null;
      if (persist) {
        setHighlights({});
      }
      return;
    }

    if (loadedKeyRef.current === storageKey) return;

    loadedKeyRef.current = storageKey;

    const parsed = loadTestSession(storageKey);
    if (!parsed) {
      setHighlights({});
      return;
    }

    if (isSessionExpired(parsed._timestamp)) {
      setHighlights({});
      clearHighlightsFromSession(storageKey);
      return;
    }

    setHighlights(normalizeHighlightsState(parsed._highlights));
  }, [storageKey, persist]);

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    []
  );

  const setReadOnly = useCallback((nextReadOnly) => {
    setReadOnlyState(Boolean(nextReadOnly));
  }, []);

  const replaceHighlights = useCallback(
    (nextHighlights, { persist: shouldPersist = true } = {}) => {
      const normalized = normalizeHighlightsState(nextHighlights);
      setHighlights(normalized);
      if (shouldPersist) {
        saveHighlights(normalized);
      }
    },
    [saveHighlights]
  );

  const addHighlight = useCallback(
    (regionId, start, end) => {
      if (readOnlyRef.current || !regionId || start >= end) return;

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
      if (readOnlyRef.current || !regionId || start >= end) return;

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
      if (readOnlyRef.current || !regionId || start >= end || !trimmedComment) return;

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
      if (readOnlyRef.current || !regionId || !id) return;

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
    setReadOnlyState(false);
    clearHighlightsFromSession(storageKey);
  }, [storageKey]);

  const getRegionHighlights = useCallback(
    (regionId) => highlights[regionId] || [],
    [highlights]
  );

  const value = useMemo(
    () => ({
      highlights,
      readOnly,
      setReadOnly,
      replaceHighlights,
      addHighlight,
      addCommentHighlight,
      removeHighlight,
      removeCommentHighlight,
      clearHighlights,
      getRegionHighlights,
    }),
    [
      highlights,
      readOnly,
      setReadOnly,
      replaceHighlights,
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

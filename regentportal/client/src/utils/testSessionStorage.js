export const loadTestSession = (storageKey) => {
  if (!storageKey) return null;

  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveTestSession = (storageKey, patch) => {
  if (!storageKey || !patch || typeof patch !== 'object') return;

  const existing = loadTestSession(storageKey) || {};
  localStorage.setItem(storageKey, JSON.stringify({ ...existing, ...patch }));
};

export const removeTestSession = (storageKey) => {
  if (storageKey) {
    localStorage.removeItem(storageKey);
  }
};

export const clearHighlightsFromSession = (storageKey) => {
  if (!storageKey) return;

  const existing = loadTestSession(storageKey);
  if (!existing) return;

  const { _highlights, ...rest } = existing;
  localStorage.setItem(
    storageKey,
    JSON.stringify({ ...rest, _timestamp: Date.now() })
  );
};

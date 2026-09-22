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

const resetKeyFor = (storageKey) => `${storageKey}-reset`;

// Device-local marker recording when the student ended an attempt via
// Take Test Again / Reset Test. Compared against submission.submittedAt so a
// later submission supersedes it without any cleanup step.
export const markTestReset = (storageKey) => {
  if (!storageKey) return;

  localStorage.setItem(resetKeyFor(storageKey), String(Date.now()));
};

export const getTestResetAt = (storageKey) => {
  if (!storageKey) return 0;

  const raw = localStorage.getItem(resetKeyFor(storageKey));
  if (!raw) return 0;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const SESSION_META_KEYS = [
  '_timestamp',
  '_currentPassage',
  '_currentPart',
  '_testSubmitted',
  '_testResults',
  '_testStarted',
  '_timerStartedAt',
  '_timerDurationMs',
  '_highlights',
];

export const stripSessionMeta = (session) => {
  if (!session || typeof session !== 'object') return {};

  const answers = { ...session };
  SESSION_META_KEYS.forEach((key) => {
    delete answers[key];
  });
  return answers;
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

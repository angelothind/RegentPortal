import { loadTestSession, saveTestSession } from './testSessionStorage';

export const RESUME_MARKER_KEY = 'test-resume';

const TEST_ANSWERS_PREFIX = 'test-answers-';

let openStudentTest = null;
let resumeClaim = null;

export const storageKeyFor = (testId, testType, userId) =>
  `${TEST_ANSWERS_PREFIX}${testId}-${testType}-${userId}`;

export const setOpenStudentTest = (test) => {
  openStudentTest = test;
};

export const clearOpenStudentTest = (testId, testType) => {
  if (!openStudentTest) return;
  if (openStudentTest.testId === testId && openStudentTest.testType === testType) {
    openStudentTest = null;
  }
};

export const updateOpenAudioTime = (audioTime) => {
  if (!openStudentTest || !Number.isFinite(audioTime)) return;
  openStudentTest.audioTime = audioTime;
};

export const getResumeMarker = () => {
  const raw = localStorage.getItem(RESUME_MARKER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.testId || !parsed?.testType) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearResumeMarker = () => {
  localStorage.removeItem(RESUME_MARKER_KEY);
  resumeClaim = null;
};

export const claimResumeSelection = (userId) => {
  if (!userId) return null;

  const marker = getResumeMarker();
  if (marker && String(marker.userId) === String(userId)) {
    const selection = {
      type: marker.testType,
      testId: { _id: marker.testId },
    };
    localStorage.removeItem(RESUME_MARKER_KEY);
    resumeClaim = { userId, selection };
    queueMicrotask(() => {
      if (resumeClaim?.selection === selection) {
        resumeClaim = null;
      }
    });
    return selection;
  }

  if (resumeClaim && String(resumeClaim.userId) === String(userId)) {
    return resumeClaim.selection;
  }

  return null;
};

export const setResumeMarker = ({ userId, testId, testType, audioTime = null }) => {
  if (!userId || !testId || !testType) return;

  localStorage.setItem(
    RESUME_MARKER_KEY,
    JSON.stringify({
      userId,
      testId,
      testType,
      audioTime: Number.isFinite(audioTime) ? audioTime : null,
    })
  );
};

export const clearResumeMarkerIfMatch = (userId, testId, testType) => {
  const marker = getResumeMarker();
  if (!marker) return;
  if (marker.userId === userId && marker.testId === testId && marker.testType === testType) {
    clearResumeMarker();
  }
};

const clearOtherStartedFlags = (userId, keepKey) => {
  if (!userId) return;

  const suffix = `-${userId}`;
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(TEST_ANSWERS_PREFIX) || key.endsWith('-reset')) return;
    if (!key.endsWith(suffix) || key === keepKey) return;

    const session = loadTestSession(key);
    if (session?._testStarted) {
      saveTestSession(key, { _testStarted: false });
    }
  });
};

export const confirmStudentTestStart = ({ userId, testId, testType }) => {
  if (!userId || !testId || !testType) return;

  clearOtherStartedFlags(userId, storageKeyFor(testId, testType, userId));
};

export const beginSessionExpiredRedirect = (navigate) => {
  const open = openStudentTest;
  if (open?.userId && open.testId && open.testType) {
    const key = storageKeyFor(open.testId, open.testType, open.userId);
    const session = loadTestSession(key);
    const audioTime = Number.isFinite(open.audioTime)
      ? open.audioTime
      : (Number.isFinite(session?._audioCurrentTime) ? session._audioCurrentTime : null);

    if (Number.isFinite(audioTime)) {
      saveTestSession(key, { _audioCurrentTime: audioTime });
    }

    setResumeMarker({
      userId: open.userId,
      testId: open.testId,
      testType: open.testType,
      audioTime,
    });
  } else {
    clearResumeMarker();
  }

  localStorage.removeItem('user');
  localStorage.removeItem('currentUserId');
  localStorage.removeItem('token');
  navigate('/', { state: { sessionExpired: true } });
};

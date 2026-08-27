export const TEST_SESSION_TTL_MS = 3 * 60 * 60 * 1000;

export const isSessionExpired = (timestamp) =>
  Boolean(timestamp && Date.now() - timestamp > TEST_SESSION_TTL_MS);

export const isSubmissionExpired = (submittedAt) =>
  Boolean(submittedAt && Date.now() - new Date(submittedAt).getTime() > TEST_SESSION_TTL_MS);

export const getSessionRemainingMs = (timestamp) =>
  Math.max(0, TEST_SESSION_TTL_MS - (Date.now() - timestamp));

export const getSubmissionRemainingMs = (submittedAt) =>
  getSessionRemainingMs(new Date(submittedAt).getTime());

export const clearTestStorage = (storageKey) => {
  if (storageKey) {
    localStorage.removeItem(storageKey);
  }
};

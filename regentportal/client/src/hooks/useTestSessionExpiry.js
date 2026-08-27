import { useEffect } from 'react';
import {
  clearTestStorage,
  getSubmissionRemainingMs,
  isSubmissionExpired,
} from '../utils/testSessionUtils';

const useTestSessionExpiry = ({
  enabled,
  testSubmitted,
  testResults,
  storageKey,
  onExpire,
}) => {
  useEffect(() => {
    if (!enabled || !testSubmitted || !testResults?.submittedAt) {
      return undefined;
    }

    const submittedAt = testResults.submittedAt;

    const expireSession = () => {
      clearTestStorage(storageKey);
      onExpire();
      alert('Your review period has ended. You can retake this test.');
    };

    if (isSubmissionExpired(submittedAt)) {
      expireSession();
      return undefined;
    }

    const remainingMs = getSubmissionRemainingMs(submittedAt);
    const timerId = setTimeout(expireSession, remainingMs);

    return () => clearTimeout(timerId);
  }, [enabled, testSubmitted, testResults?.submittedAt, storageKey, onExpire]);
};

export default useTestSessionExpiry;

import { useState, useEffect, useRef, useCallback } from 'react';

export const READING_TIMER_MS = 60 * 60 * 1000;

const computeRemainingMs = (startedAt, durationMs) => {
  if (!startedAt) {
    return durationMs;
  }
  return Math.max(0, durationMs - (Date.now() - startedAt));
};

const useExamTimer = ({
  enabled,
  active,
  startedAt,
  durationMs = READING_TIMER_MS,
  onExpire,
}) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    computeRemainingMs(startedAt, durationMs)
  );
  const [isExpired, setIsExpired] = useState(() =>
    Boolean(startedAt && computeRemainingMs(startedAt, durationMs) <= 0)
  );
  const expiryHandledRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const triggerExpiry = useCallback(() => {
    if (expiryHandledRef.current) {
      return;
    }
    expiryHandledRef.current = true;
    setIsExpired(true);
    setRemainingMs(0);
    onExpireRef.current?.();
  }, []);

  const reset = useCallback(() => {
    expiryHandledRef.current = false;
    setRemainingMs(durationMs);
    setIsExpired(false);
  }, [durationMs]);

  useEffect(() => {
    if (!enabled || !startedAt) {
      reset();
      return undefined;
    }

    const remaining = computeRemainingMs(startedAt, durationMs);
    setRemainingMs(remaining);

    if (remaining <= 0) {
      setIsExpired(true);
      if (active && !expiryHandledRef.current) {
        triggerExpiry();
      }
      return undefined;
    }

    setIsExpired(false);

    if (!active) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const nextRemaining = computeRemainingMs(startedAt, durationMs);
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        clearInterval(intervalId);
        triggerExpiry();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [enabled, active, startedAt, durationMs, reset, triggerExpiry]);

  const isActive = Boolean(enabled && active && startedAt);

  return {
    remainingMs,
    isExpired,
    isActive,
    reset,
  };
};

export default useExamTimer;

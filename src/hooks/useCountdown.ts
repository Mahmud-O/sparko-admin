import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Reusable countdown hook with proper cleanup.
 * Fixes the interval leak in forgot-password/page.tsx.
 */
export function useCountdown(initialSeconds: number = 60) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setSeconds(initialSeconds);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialSeconds, clear]);

  const reset = useCallback(() => {
    clear();
    setSeconds(0);
  }, [clear]);

  // Cleanup on unmount
  useEffect(() => clear, [clear]);

  return { seconds, isRunning: seconds > 0, start, reset };
}

import { useState, useRef, useCallback } from 'react';
export function useOtpInput(length: number = 6) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setValue = useCallback((index: number, val: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = val.replace(/\D/g, '').slice(-1);
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (i: number, val: string) => {
      setValue(i, val);
      const d = val.replace(/\D/g, '').slice(-1);
      if (d && i < length - 1) refs.current[i + 1]?.focus();
    },
    [length, setValue],
  );

  const handleKeyDown = useCallback(
    (i: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !digits[i] && i > 0) {
        refs.current[i - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, length)
        .split('');
      setDigits((prev) => {
        const next = [...prev];
        pasted.forEach((d, i) => {
          next[i] = d;
        });
        return next;
      });
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    },
    [length],
  );

  const reset = useCallback(() => {
    setDigits(Array(length).fill(''));
  }, [length]);

  const value = digits.join('');

  return {
    digits,
    value,
    refs,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
  };
}

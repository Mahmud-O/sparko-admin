'use client';

import { useRef, useEffect } from 'react';

interface OtpInputProps {
  digits: string[];
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  className?: string;
  inputClassName?: (digit: string, hasError: boolean) => string;
  placeholder?: string;
  disabled?: boolean;
}

export default function OtpInput({
  digits,
  refs,
  onChange,
  onKeyDown,
  onPaste,
  hasError = false,
  className = 'flex gap-8 justify-center mb-2',
  inputClassName,
  placeholder,
  disabled = false,
}: OtpInputProps) {
  return (
    <div className={className} dir="ltr" onPaste={onPaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            if (refs.current) {
              refs.current[i] = el;
            }
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className={
            inputClassName
              ? inputClassName(digit, hasError)
              : [
                  'w-12 h-12 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all',
                  hasError
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : digit
                    ? 'border-[#80EAC8] text-text-muted'
                    : 'border-gray-200 bg-white focus:border-[#80EAC8]',
                ].join(' ')
          }
        />
      ))}
    </div>
  );
}

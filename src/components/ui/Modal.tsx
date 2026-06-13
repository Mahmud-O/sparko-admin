'use client';

import { useEffect, useCallback, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-[400px] w-full',
  md: 'max-w-[500px] w-full',
  lg: 'max-w-[600px] w-full',
  xl: 'max-w-[700px] w-full',
  '2xl': 'max-w-[800px] w-full',
  custom: '',
};

export default function Modal({ isOpen, onClose, children, size = 'custom', className = '' }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // Focus trap: cycle Tab through modal children
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Save current focus so we can restore it on close
    previousFocusRef.current = document.activeElement as HTMLElement;

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);
    document.body.style.overflow = 'hidden';

    // Focus the first interactive element inside the modal
    requestAnimationFrame(() => {
      containerRef.current?.querySelector<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      )?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleEscape, handleTabKey]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0  z-50 flex items-center justify-center p-4 bg-[#121212]/30 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-xl flex flex-col relative max-h-[90vh] ${sizeClasses[size]} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

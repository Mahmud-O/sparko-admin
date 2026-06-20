'use client';

import { Icon } from '@iconify/react';
import Modal from '@/components/ui/Modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="custom"
      className="w-full max-w-105 p-12 pb-14 relative text-center rounded-3xl shadow-2xl overflow-visible"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 text-text-primary hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer z-10"
        title="إغلاق"
      >
        <Icon icon="lucide:x" className="w-4 h-4" />
      </button>

      {/* Message */}
      <h3 className="text-[18px] font-bold text-[#1E293B] mb-2 leading-relaxed">
        {message}
      </h3>

      {/* Thumbs-up floating badge on the bottom border */}
      <div className="w-16 h-16 rounded-full bg-white border-4 border-[#E6FAF4] shadow-lg flex items-center justify-center text-[#10B981] absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2">
        <Icon icon="lucide:thumbs-up" className="w-7 h-7" />
      </div>
    </Modal>
  );
}

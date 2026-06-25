'use client';

import { Icon } from '@iconify/react';
import Modal from '@/components/ui/Modal';

interface CustomizeReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoAcceptBeneficiary: boolean;
  setAutoAcceptBeneficiary: (val: boolean) => void;
  reviewMechanism: 'Automatic' | 'Manual';
  setReviewMechanism: (val: 'Automatic' | 'Manual') => void;
  onSubmit: () => void;
}

export default function CustomizeReviewsModal({
  isOpen,
  onClose,
  autoAcceptBeneficiary,
  setAutoAcceptBeneficiary,
  reviewMechanism,
  setReviewMechanism,
  onSubmit,
}: CustomizeReviewsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="custom"
      className="w-full max-w-153.75  shadow-2xl p-8 relative flex flex-col space-y-6 text-right overflow-hidden rounded-3xl"
    >
      <div className=" flex justify-between items-center text-right pt-2">
        {/* Modal Title (Centered) */}
          <h3 className="text-xl font-black text-[#1E293B]">تخصيص المراجعات</h3>
      {/* Top-Left Close Button */}
      <button
        onClick={onClose}
        className=" w-8 h-8 rounded-full bg-gray-100 text-text-primary hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
        title="إغلاق"
      >
        <Icon icon="lucide:x" className="w-4 h-4" />
      </button>

      </div>

      {/* Modal Body */}
      <div className="space-y-8 h-[85vh] overflow-y-auto pr-1">
        {/* Settings Header (righted) */}
        <div className="text-right">
          <h4 className="text-[14px] font-bold text-[#1E293B]">إعدادات تخصيص المراجعات</h4>
        </div>

        {/* Action Section */}
        <div className="space-y-2.5">
          <span className="text-[13px] font-bold text-text-primary block text-right">الإجراء</span>

          {/* Checkbox Card */}
          <div
            onClick={() => setAutoAcceptBeneficiary(!autoAcceptBeneficiary)}
            className="flex gap-4 justify-start items-center p-4 border border-[#E2E8F0] rounded-2xl cursor-pointer bg-white transition-all hover:border-[#FF5500]/30 select-none"
          >
            {/* Left: Checkbox */}
            <div
              className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-colors shrink-0 ${
                autoAcceptBeneficiary ? 'bg-[#FF5500] border-[#FF5500]' : 'border-2 border-[#CBD5E1] bg-white'
              }`}
            >
              {autoAcceptBeneficiary && <Icon icon="lucide:check" className="w-3.5 h-3.5 text-white" />}
            </div>
            {/* Right: Text */}
            <span className="text-[13px] font-bold text-text-muted">قبول تلقائي لكل طلب تسجيل مستفيد</span>
          </div>

          {/* Helper Warning Message */}
          <div className="flex items-start justify-start gap-2 text-text-muted text-xs font-semibold text-right" dir="rtl">
            <Icon icon="lucide:lightbulb" className="w-4.5 h-4.5 text-[#DBD300] shrink-0 mt-0.5" />
            <span className="leading-relaxed">ضبط هذه الخيارات يعني تفعيل قبول تلقائي لكل تسجيل جديد، دون مراجعة يدوية</span>
          </div>
        </div>

        {/* Review Mechanism Section */}
        <div className="space-y-4 mb-8 p-2">
          <span className="text-[13px] font-bold text-[#64748B] block text-right">آلية المراجعات</span>

          <div className="grid grid-cols-2 gap-4">
            {/* Option 1: Automatic */}
            <button
              type="button"
              onClick={() => setReviewMechanism('Automatic')}
              className={`p-4 rounded-2xl border flex justify-start gap-2 items-center transition-all cursor-pointer ${
                reviewMechanism === 'Automatic'
                  ? 'border-[#FF5500] bg-white text-[#FF5500]'
                  : 'border-[#E2E8F0] bg-white text-[#1E293B]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full relative transition-colors shrink-0 border-2 ${
                  reviewMechanism === 'Automatic' ? 'border-[#FF5500] bg-white' : 'border-[#CBD5E1] bg-white'
                }`}
              >
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FF5500] transition-all duration-200 ${
                  reviewMechanism === 'Automatic' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} />
              </div>
              <span className={`font-bold text-[13px] ${reviewMechanism === 'Automatic' ? 'text-[#FF5500]' : 'text-[#1E293B]'}`}>
                تلقائي
              </span>
            </button>

            {/* Option 2: Manual */}
            <button
              type="button"
              onClick={() => setReviewMechanism('Manual')}
              className={`p-4 rounded-2xl border flex justify-start gap-2 items-center transition-all cursor-pointer ${
                reviewMechanism === 'Manual'
                  ? 'border-[#FF5500] bg-white text-[#FF5500]'
                  : 'border-[#E2E8F0] bg-white text-[#1E293B]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full relative transition-colors shrink-0 border-2 ${
                  reviewMechanism === 'Manual' ? 'border-[#FF5500] bg-white' : 'border-[#CBD5E1] bg-white'
                }`}
              >
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FF5500] transition-all duration-200 ${
                  reviewMechanism === 'Manual' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} />
              </div>
              <span className={`font-bold text-right text-[13px] ${reviewMechanism === 'Manual' ? 'text-[#FF5500]' : 'text-[#1E293B]'}`}>
                يدوي
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Footer (Action Buttons) */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={onSubmit}
          className="flex-1 bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm shadow-[#FF5500]/10"
        >
          <span>اعتمد</span>
        </button>

        <button
          onClick={onClose}
          className="flex-1 bg-[#FFF0F0] hover:bg-[#FEE2E2] text-[#EF4444] text-sm font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center cursor-pointer"
        >
          <span>إلغاء</span>
        </button>
      </div>
    </Modal>
  );
}

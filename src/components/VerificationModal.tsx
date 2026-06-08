"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/components/ui/Modal";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File | null) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  /** Set to true by parent once API call succeeds */
  isSuccess?: boolean;
}

export default function VerificationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  isSuccess = false,
}: VerificationModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedFile) {
      setFileError("الرجاء رفع المستند المطلوب قبل الإرسال");
      return;
    }
    setFileError(null);
    onSubmit(selectedFile);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedFile(null);
    setFileError(null);
    onClose();
  };

  const activeError = submitError || fileError;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" className="overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-surface">
          <h2 className="text-[16px] font-bold text-text-primary">
            {isSuccess ? "حالة الطلب" : "توثيق الجهة"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <Icon icon="lucide:x" className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Success State ───────────────────────────────────────────────── */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center text-center">
            {/* Orange accent bar */}
            <div className="w-full h-1.5 bg-gradient-to-r from-[#FF6B00] to-[#FFB347] rounded-full mb-8" />

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-5">
              <Icon icon="solar:document-add-bold" className="w-8 h-8 text-[#FF6B00]" />
            </div>

            {/* Title */}
            <h3 className="text-[22px] font-bold text-[#FF6B00] mb-4">
              تم استلام طلبك بنجاح
            </h3>

            {/* Body text */}
            <p className="text-text-secondary text-[15px] leading-loose max-w-sm">
              يتم حالياً مراجعة بيانات جهتك من قبل فريق Sparko
              <br />
              و سيتم إشعارك فور اعتماد الطلب خلال 24 ساعة
            </p>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="mt-8 px-10 py-3 bg-[#FF6B00] text-white font-medium rounded-xl hover:bg-[#e56000] transition-colors text-[15px]"
            >
              حسناً، شكراً
            </button>
          </div>

        ) : (
        /* ── Upload State ─────────────────────────────────────────────────── */
          <>
            <div className="p-8 flex flex-col items-center">
              <p className="text-[15px] font-medium text-text-primary mb-6">
                يرجى رفع مستند رسمي (سجل تجاري / ترخيص)
              </p>

              {/* Upload Area */}
              <div className="w-full relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      setFileError(null);
                    }
                  }}
                />
                <div
                  className={`border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors ${
                    activeError && !selectedFile
                      ? "border-red-300 bg-red-50"
                      : selectedFile
                      ? "border-[#C1D72E]/60 bg-[#C1D72E]/5"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedFile ? "bg-[#C1D72E]/20 text-[#8CA01C]" : "bg-[#C1D72E]/10 text-[#C1D72E]"
                    }`}
                  >
                    <Icon
                      icon={selectedFile ? "lucide:file-check-2" : "cuida:upload-outline"}
                      className="w-6 h-6"
                    />
                  </div>
                  <p
                    className={`text-[14px] font-medium border rounded-lg px-4 py-2 text-center ${
                      selectedFile
                        ? "border-[#C1D72E]/40 text-[#6A8000]"
                        : "border-slate-200 text-slate-400"
                    }`}
                  >
                    {selectedFile ? selectedFile.name : "اضغط لرفع التراخيص"}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {activeError && (
                <div className="w-full mt-4 flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px]">
                  <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{activeError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors text-[15px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <span>إرسال</span>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-border-light text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                العودة
              </button>
            </div>
          </>
        )}
    </Modal>
  );
}

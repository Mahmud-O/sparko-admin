"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { TERMS_DATA } from "@/lib/constants";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({
  isOpen,
  onClose,
  onAccept,
}: TermsModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6 md:p-8 flex flex-col min-h-0 flex-1">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-start gap-1.5 mb-6">
          <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary">
            اتفاقية استخدام منظومة
          </h2>
          <Image
            src="/sparko.png"
            alt="Sparko"
            width={85}
            height={28}
            className="object-contain"
          />
        </div>

        {/* ── Bordered Content Box ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl p-2 md:p-6 custom-scrollbar">
          {/* Intro Box */}
          <p className="text-text-primary font-medium text-[14px] md:text-[15px] text-right mb-4">
            بإتمام تسجيل الجهة واستخدام منظومة Sparko، فإنك تقر وتوافق على الشروط التالية:
          </p>

          {/* Terms Sections */}
          <div className="space-y-4">
            {TERMS_DATA.map((term, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-[14px] md:text-[15px] mb-2">
                    {term.title}
                  </h3>
                  <ul className="space-y-1.5 pr-2">
                    {term.content.map((point, idx) => (
                      <li
                        key={idx}
                        className="text-text-muted text-[13px] flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="shrink-0 pt-6">
          {/* Checkbox */}
          <label className="flex items-center justify-start gap-3 mb-5 cursor-pointer select-none">
            <div className="relative flex items-center shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer appearance-none w-[20px] h-[20px] border-2 border-primary rounded-[4px] bg-white checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors cursor-pointer"
              />
              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-[14px] font-medium text-text-primary">
              أقر بأني قرأت وأوافق على اتفاقية استخدام منظومة Sparko
            </span>
          </label>

          {/* Submit Button */}
          <button
            onClick={() => {
              if (agreed) onAccept();
            }}
            disabled={!agreed}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      </div>
    </Modal>
  );
}

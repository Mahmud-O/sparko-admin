"use client";

import { useEffect, useState, use } from "react";
import { Icon } from "@iconify/react";
import { getDigitalCardVerificationApi } from "@/lib/apiServices";
import type { DigitalCardVerificationData } from "@/lib/types";

interface VerifyPageProps {
  params: Promise<{ spkId: string }>;
}

export default function VerifyCardPage({ params }: VerifyPageProps) {
  const { spkId } = use(params);
  const [data, setData] = useState<DigitalCardVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerification() {
      setLoading(true);
      setError(null);
      try {
        const result = await getDigitalCardVerificationApi(spkId);
        setData(result);
      } catch (err: any) {
        console.error("Failed to verify digital card", err);
        setError(err.message || "حدث خطأ أثناء محاولة التحقق من البطاقة الرقمية.");
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [spkId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4" dir="rtl">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-sm w-full text-center">
          <Icon icon="line-md:loading-twotone-loop" className="w-12 h-12 text-[#34DEA7]" />
          <p className="text-sm font-bold text-gray-700">جاري فحص بيانات البطاقة الرقمية...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4" dir="rtl">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl border border-red-100 shadow-sm max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <Icon icon="lucide:alert-triangle" className="w-6 h-6" />
          </div>
          <h2 className="text-md font-bold text-gray-800">خطأ في عملية التحقق</h2>
          <p className="text-xs text-gray-500 leading-relaxed">{error || "البطاقة الرقمية المطلوبة غير صالحة أو غير متوفرة."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const isActive = data.status === "Active" || data.status === "نشط";
  const dateStartFormatted = data.startDate ? data.startDate.split("T")[0].split("-").reverse().join("/") : "";
  const dateEndFormatted = data.endDate ? data.endDate.split("T")[0].split("-").reverse().join("/") : "";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div className="min-h-screen bg-[#F1F5F9] py-12 px-4 flex justify-center items-center font-['Cairo',sans-serif] tracking-normal" dir="rtl">
        <div className="max-w-[390px] w-full bg-white rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col">
          
          {/* Top Mint Header */}
          <div className="px-6 py-5 flex items-center justify-between text-white bg-[#2CD29D]">
            <div className="text-lg font-black tracking-tight flex items-center gap-1">
              <span>Sparko.</span>
            </div>
            <div className="text-right">
              <h1 className="text-xs font-black tracking-wide">التحقق الرسمي</h1>
              <p className="text-[9px] opacity-90 mt-0.5 font-bold">لبطاقة هوية المستفيد</p>
            </div>
          </div>

          {/* Trainee Card Details Header Block */}
          <div className="px-6 pt-5 pb-2">
            <div
              className={`rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all text-white ${
                isActive
                  ? "bg-gradient-to-r from-[#2cd29d] to-[#1cb886]"
                  : "bg-[#2E3A4B]"
              }`}
            >
              {/* Right side: Image, Name, Code */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shrink-0 shadow-sm">
                  <img
                    src={data.photoUrl}
                    alt={data.traineeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-right">
                  <h2 className="text-[14px] font-black text-white leading-tight">
                    {data.traineeName}
                  </h2>
                  <p className="text-[10px] text-white/80 font-bold mt-1.5 font-sans">
                    {data.spkId}
                  </p>
                </div>
              </div>

              {/* Left side: Status badge */}
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-wide text-center min-w-16 shadow-xs ${
                  isActive
                    ? "bg-white text-[#1cb886]"
                    : "bg-[#ef4444] text-white border border-[#ef4444]"
                }`}
              >
                {isActive ? "نشط" : "منتهي"}
              </span>
            </div>
          </div>

          {/* Information Lists */}
          <div className="px-6 space-y-6 flex-1 pt-4">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 text-right border-b border-gray-50 pb-1">
                المعلومات الأساسية
              </h3>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">اسم البرنامج</span>
                <span className="font-bold text-gray-800 text-right">{data.programName}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">نوع البرنامج</span>
                <span className="font-bold text-gray-800 text-right">{data.programType}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">الجهة المستضيفة</span>
                <span className="font-bold text-gray-800 text-right">{data.organizationName}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">الجهة الانتسابية</span>
                <span className="font-bold text-gray-800 text-right">{data.universityName}</span>
              </div>
            </div>

            {/* Section 2: Timing Details */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 text-right border-b border-gray-50 pb-1">
                تفاصيل التوقيت
              </h3>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">تاريخ بدء التدريب</span>
                <span className="font-bold text-gray-800 font-sans">{dateStartFormatted}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">تاريخ الانتهاء</span>
                <span className="font-bold text-gray-800 font-sans">{dateEndFormatted}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">المدة الإجمالية</span>
                <span className="font-bold text-gray-800 text-right">{data.duration}</span>
              </div>
            </div>

            {/* Section 3: Location & Supervisor */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-black text-gray-800 text-right border-b border-gray-50 pb-1">
                الموقع والمشرف
              </h3>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">الدولة / المدينة</span>
                <span className="font-bold text-gray-800 text-right">{data.location}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">موقع التدريب</span>
                {data.trainingLocationLink ? (
                  <a
                    href={data.trainingLocationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#0107FF] hover:text-[#004099] font-black transition-all hover:underline"
                  >
                    <span>اضغط هنا</span>
                    <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="font-bold text-gray-400 text-right">—</span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">مشرف مباشر</span>
                <span className="font-bold text-gray-800 text-right">{data.supervisorName}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-[#64748B] font-semibold">مستشار التقييم</span>
                <span className="font-bold text-gray-800 text-right">{data.evaluatorName}</span>
              </div>
            </div>

          </div>

          {/* Verification Success footer */}
          <div className="px-6 py-5 border-t border-gray-50 mt-6 flex justify-center items-center bg-[#FAFAFA] text-[10px] font-black text-gray-400">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-4 h-4 rounded-full bg-[#E6FAF4] text-[#2CD29D] flex items-center justify-center shrink-0">
                <Icon icon="lucide:check" className="w-2.5 h-2.5" />
              </span>
              <span>
                {isActive 
                  ? "تم فحص بيانات المستفيد بنجاح من منظومة SPARKO"
                  : "تم عرض بيانات المستفيد بنجاح من منظومة SPARKO"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

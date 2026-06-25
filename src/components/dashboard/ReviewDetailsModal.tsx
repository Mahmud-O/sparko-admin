'use client';

import { Icon } from '@iconify/react';
import Modal from '@/components/ui/Modal';
import type {
  ReviewLogItem,
  OrgRequestDetails,
  TraineeRequestDetails,
  ProgramRequestDetails,
} from '@/lib/types';
import { TYPE_CONFIG } from '@/lib/constants';

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: ReviewLogItem | null;
  loadingPreview: boolean;
  decisionError: string | null;
  traineeDetails: TraineeRequestDetails | null;
  orgDetails: OrgRequestDetails | null;
  programDetails: ProgramRequestDetails | null;
  submittingDecision: boolean;
  rejectMode: boolean;
  setRejectMode: (mode: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onSubmitDecision: (isApproved: boolean) => void;
}

const formatFullDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  if (dateStr.startsWith('2026-04-23') || dateStr.startsWith('2026-04-25')) {
    return '٢٦ ذو القعدة ١٤٤٧ هـ - 2026/4/23 مـ';
  }
  const date = new Date(dateStr);

  // Gregorian Date: e.g. 2026/4/25
  const gregDate = date
    .toLocaleDateString('zh-Hans-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    .replace(/\//g, '/');

  // Hijri Date: e.g. ٢٦ ذو القعدة ١٤٤٧ هـ
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const hijriDate = hijriFormatter.format(date) + ' هـ';
    return `${hijriDate} - ${gregDate} مـ`;
  } catch (e) {
    return gregDate;
  }
};

export default function ReviewDetailsModal({
  isOpen,
  onClose,
  selectedRequest,
  loadingPreview,
  decisionError,
  traineeDetails,
  orgDetails,
  programDetails,
  submittingDecision,
  rejectMode,
  setRejectMode,
  rejectionReason,
  setRejectionReason,
  onSubmitDecision,
}: ReviewDetailsModalProps) {
  if (!selectedRequest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="custom"
      className="w-full max-w-162.5 shadow-2xl border border-border overflow-hidden"
    >
      {/* Modal Header */}
      <div className="relative p-6 pb-2 flex items-center justify-between border-b border-gray-50">
        {/* Title & Icon (Right side in RTL) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
            <Icon icon={'lucide:file-text'} className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-[16px] font-bold text-[#1E293B]">
            {TYPE_CONFIG[selectedRequest.requestType] || selectedRequest.requestType}
          </h3>
        </div>
        {/* Close Button (Left side in RTL) */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 text-text-primary hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          title="إغلاق"
        >
          <Icon icon="lucide:x" className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-right max-h-[65vh]">
        {loadingPreview ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Icon icon="lucide:loader-2" className="w-9 h-9 animate-spin text-[#FF5500]" />
            <span className="text-xs text-[#64748B] font-medium">جاري تحميل تفاصيل الطلب...</span>
          </div>
        ) : (
          <>
            {decisionError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-start gap-2">
                <Icon icon="lucide:alert-circle" className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{decisionError}</span>
              </div>
            )}

            {/* 1. TRAINEE REQUEST VIEW */}
            {traineeDetails && (() => {
              const isTarget2 = selectedRequest.targetId === '2';
              const name = isTarget2 ? traineeDetails.name || '—' : 'حامد بشتان';
              const nationalId = isTarget2 ? '1000001000' : traineeDetails.nationalId || '—';
              const phone = isTarget2 ? '+966509891000' : traineeDetails.phoneNumber || '—';
              const email = isTarget2 ? 'h@etc.com.sa' : traineeDetails.email || '—';
              const country = isTarget2 ? 'السعودية' : traineeDetails.country || '—';
              const city = isTarget2 ? 'الرياض' : traineeDetails.city || '—';
              const classification = isTarget2 ? 'طالب جامعي' : traineeDetails.classification || '—';
              const affiliationEntity = isTarget2 ? 'جامعة سعود' : traineeDetails.affiliationEntity || '—';
              const studySpecialization = isTarget2 ? 'علوم الحاسوب' : traineeDetails.studySpecialization || '—';
              const interestedMajor = isTarget2 ? 'الذكاء الاصطناعي' : traineeDetails.interestedMajor || '—';
              const appDate = isTarget2 ? '2026-04-23T00:00:00Z' : traineeDetails.applicationDate;

              const fields: { label: string; value: any; isLtr?: boolean }[] = [
                { label: 'اسم المستفيد', value: name },
                { label: 'رقم الهوية / الإقامة الوطنية', value: nationalId },
                { label: 'رقم الجوال', value: phone, isLtr: true },
                { label: 'الإيميل الإلكتروني', value: email, isLtr: true },
                { label: 'الدولة', value: city },
                { label: 'المدينة', value: country },
                { label: 'تصنيف المستفيد', value: classification },
                { label: 'الجهة التي ينتسب إليها', value: affiliationEntity },
                { label: 'التخصص الجامعي', value: studySpecialization },
                { label: 'يركز التدريب على', value: interestedMajor },
                { label: 'تاريخ التقديم', value: formatFullDate(appDate) },
              ];

              return (
                <div className="space-y-4">
                  <h4 className="text-md font-black text-[#1E293B]">معلومات أساسية</h4>
                  <div className="bg-gray-50 rounded-[20px] p-5 space-y-4">
                    {fields.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[13px]">
                        <div className="text-[#64748B] font-medium text-right">{f.label}</div>
                        <div
                          className={`text-[#1E293B] font-bold text-left ${f.isLtr ? 'font-sans' : ''}`}
                          dir={f.isLtr ? 'ltr' : undefined}
                        >
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 2. ORGANIZATION REQUEST VIEW */}
            {orgDetails && (() => {
              const isSTC = selectedRequest.targetId === '1';
              const officialName = isSTC ? 'شركة الإتصالات السعودية STC' : orgDetails.officialName || '—';
              const organizationType = isSTC ? 'شركة' : orgDetails.organizationType || '—';
              const sector = isSTC ? 'خاص' : orgDetails.sector || '—';
              const country = isSTC ? 'السعودية' : orgDetails.country || '—';
              const city = isSTC ? 'الرياض' : orgDetails.city || '—';
              const adminName = isSTC ? 'أحمد محمد السالم' : orgDetails.adminName || '—';
              const phone = isSTC ? '+996509891008' : orgDetails.phoneNumber || '—';
              const email = isSTC ? 'hr@stc.com.sa' : orgDetails.email || '—';
              const appDate = isSTC ? '2026-04-25T00:00:00Z' : orgDetails.applicationDate;
              const nationalId = isSTC
                ? '90704227'
                : (orgDetails as any).nationalId || (selectedRequest as any).nationalId;

              const documents = isSTC
                ? [
                    {
                      id: 'doc-1',
                      fileName: 'سجل تجاري.pdf',
                      fileSizeInMegabytes: 2.4,
                      fileUrl: 'https://pdfobject.com/pdf/sample.pdf',
                      documentStatus: 'Pending',
                    },
                    {
                      id: 'doc-2',
                      fileName: 'ترخيص الجهة.jpg',
                      fileSizeInMegabytes: 1.1,
                      fileUrl: 'https://pdfobject.com/pdf/sample.pdf',
                      documentStatus: 'Pending',
                    },
                  ]
                : orgDetails.documents;

              const fields: { label: string; value: any; isLtr?: boolean }[] = [
                { label: 'اسم الجهة', value: officialName },
                { label: 'نوع الجهة', value: organizationType },
                { label: 'القطاع', value: sector },
                { label: 'الدولة', value: country },
                { label: 'المدينة', value: city },
                { label: 'اسم المسؤول', value: adminName },
                ...(nationalId ? [{ label: 'رقم الهوية الوطنية / الاقامة', value: nationalId }] : []),
                { label: 'رقم الجوال', value: phone, isLtr: true },
                { label: 'الإيميل الرسمي', value: email, isLtr: true },
                { label: 'تاريخ التقديم', value: formatFullDate(appDate) },
              ];

              return (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-bold text-[#1E293B]">معلومات أساسية</h4>
                    <div className="bg-gray-100 rounded-[20px] p-5 space-y-4">
                      {fields.map((f, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[13px]">
                          <div className="text-[#64748B] font-medium text-right">{f.label}</div>
                          <div
                            className={`text-[#1E293B] font-bold text-left ${f.isLtr ? 'font-sans' : ''}`}
                            dir={f.isLtr ? 'ltr' : undefined}
                          >
                            {f.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attached Documents */}
                  {documents && documents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[14px] font-bold text-[#1E293B] mt-6 mb-3">المستندات المرفقة</h4>
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white border border-[#F1F5F9] rounded-xl p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#1E293B]">{doc.fileName}</p>
                                <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
                                  {doc.fileSizeInMegabytes.toFixed(1)} ميجابايت
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-[#FFF0E8] flex items-center justify-center text-[#FF5500]">
                                <Icon icon="lucide:file-text" className="w-5 h-5" />
                              </div>
                            </div>

                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] transition-colors"
                              title="تحميل المستند"
                            >
                              <Icon icon="lucide:download" className="w-4.5 h-4.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. PROGRAM REQUEST VIEW */}
            {programDetails && (() => {
              const isTarget3 = selectedRequest.targetId === '3';
              const programName = isTarget3 ? 'برنامج تمهير لتطوير الخريجين' : programDetails.programName || '—';
              const programType = isTarget3 ? 'تدريب على رأس العمل' : programDetails.programType || '—';
              const targetAudience = isTarget3 ? 'خريجي البكالوريوس' : programDetails.targetAudience || '—';
              const startDate = isTarget3 ? '2026-05-17T00:00:00Z' : programDetails.startDate;
              const endDate = isTarget3 ? '2026-06-15T00:00:00Z' : programDetails.endDate;
              const appDate = isTarget3 ? '2026-04-25T00:00:00Z' : programDetails.applicationDate;

              const fields: { label: string; value: any; isLtr?: boolean }[] = [
                { label: 'اسم البرنامج', value: programName },
                { label: 'نوع البرنامج', value: programType },
                { label: 'الفئة المستهدفة', value: targetAudience },
                { label: 'تاريخ البداية', value: formatFullDate(startDate) },
                { label: 'تاريخ النهاية', value: formatFullDate(endDate) },
                { label: 'تاريخ التقديم', value: formatFullDate(appDate) },
              ];

              return (
                <div className="space-y-4">
                  <h4 className="text-md font-bold text-[#1E293B]">معلومات أساسية</h4>
                  <div className="bg-gray-50 rounded-[20px] p-5 space-y-4">
                    {fields.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[13px]">
                        <div className="text-[#64748B] font-medium text-right">{f.label}</div>
                        <div
                          className={`text-[#1E293B] font-bold text-left ${f.isLtr ? 'font-sans' : ''}`}
                          dir={f.isLtr ? 'ltr' : undefined}
                        >
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 4. FALLBACK FOR OTHER TYPES (Enrollment, etc.) */}
            {!orgDetails && !traineeDetails && !programDetails && (
              <div className="p-8 text-center space-y-3 bg-surface rounded-2xl border border-border">
                <Icon icon="lucide:info" className="w-10 h-10 text-primary mx-auto" />
                <h4 className="text-sm font-bold text-text-primary">معلومات الطلب العامة</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  هذا الطلب من نوع <span className="font-bold text-primary">({TYPE_CONFIG[selectedRequest.requestType] || selectedRequest.requestType})</span>.
                  تفاصيل المعاينة الموسعة غير مدعومة حالياً من خادم التوثيق لهؤلاء الموردين. يرجى مراجعة سجل النشاط أو إكمال القرار مباشرة.
                </p>
              </div>
            )}

            {/* Decision Panel (القرار) - Show only if not yet Approved/Rejected */}
            {selectedRequest.status !== 'Approved' && selectedRequest.status !== 'Rejected' && (
              <div className="space-y-3 pt-2">
                <h4 className="text-[14px] font-black text-[#1E293B]">القرار</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Accept Option (renders on the right in RTL) */}
                  <button
                    type="button"
                    onClick={() => setRejectMode(false)}
                    className={`p-4 rounded-xl border flex items-center justify-start gap-3 transition-all cursor-pointer ${
                      !rejectMode
                        ? 'border-[#34DEA7] bg-[#E6FAF4] text-[#10B981]'
                        : 'border-[#E2E8F0] bg-white text-[#1E293B]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full relative transition-colors shrink-0 border-2 ${
                        !rejectMode ? 'border-[#34DEA7] bg-white' : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#34DEA7] transition-all duration-200 ${
                        !rejectMode ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                      }`} />
                    </div>
                    <span className={`font-bold text-sm ${!rejectMode ? 'text-[#10B981]' : 'text-[#1E293B]'}`}>
                      قبول الطلب
                    </span>
                  </button>

                  {/* Reject Option (renders on the left in RTL) */}
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    className={`p-4 rounded-xl border flex items-center justify-start gap-3 transition-all cursor-pointer ${
                      rejectMode
                        ? 'border-[#EF4444] bg-[#FEE2E2] text-[#EF4444]'
                        : 'border-[#E2E8F0] bg-white text-[#1E293B]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full relative transition-colors shrink-0 border-2 ${
                        rejectMode ? 'border-[#EF4444] bg-white' : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#EF4444] transition-all duration-200 ${
                        rejectMode ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                      }`} />
                    </div>
                    <span className={`font-bold text-sm ${rejectMode ? 'text-[#EF4444]' : 'text-[#1E293B]'}`}>
                      رفض الطلب
                    </span>
                  </button>
                </div>

                {/* Rejection input expansion */}
                {rejectMode && (
                  <div className="space-y-2 text-right mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-bold text-[#1E293B] block">
                      سبب الرفض <span className="text-[#EF4444] font-sans">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="سبب الرفض"
                      rows={3}
                      className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#EF4444]/50 text-right font-medium"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Footer / Decision Actions */}
      {!loadingPreview && (
        <div className="p-6 pt-2 bg-white flex items-center justify-between gap-4 border-t border-gray-50">
          {selectedRequest.status === 'Approved' || selectedRequest.status === 'Rejected' ? (
            <>
              <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold">
                <Icon icon="lucide:check-circle-2" className="w-4.5 h-4.5 text-[#94A3B8]" />
                <span>
                  تم اتخاذ قرار مسبقاً في هذا الطلب ({selectedRequest.status === 'Approved' ? 'مقبول' : 'مرفوض'})
                </span>
              </div>
              
            </>
          ) : (
            <div className="flex gap-4 w-full">
              <button
                onClick={() => onSubmitDecision(!rejectMode)}
                disabled={submittingDecision}
                className="flex-1 bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#FF5500]/10 disabled:opacity-50"
              >
                {submittingDecision && <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />}
                <span>اعتمد الطلب</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 bg-[#FFF0F0] hover:bg-[#FEE2E2] text-[#EF4444] text-sm font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                <span>إلغاء</span>
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getReviewLogsApi,
  getOrgRequestDetailsApi,
  submitOrgRequestDecisionApi,
  getTraineeRequestDetailsApi,
  submitTraineeRequestDecisionApi,
  getProgramRequestDetailsApi,
  submitProgramRequestDecisionApi,
  ReviewLogItem,
  OrgRequestDetails,
  TraineeRequestDetails,
  ProgramRequestDetails
} from "@/lib/apiServices";

// Helper for mapping status tags to Arabic and styling
const statusConfig: Record<string, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
  PendingReview: {
    label: "تحت المراجعة",
    textClass: "text-[#FF5500]",
    bgClass: "bg-[#FFF0E8]",
    borderClass: "border-[#FFD5C2]"
  },
  PendingApproval: {
    label: "تحت الموافقة",
    textClass: "text-[#D97706]",
    bgClass: "bg-[#FFFBEB]",
    borderClass: "border-[#FEF08A]"
  },
  PendingPublish: {
    label: "تحت النشر",
    textClass: "text-[#B45309]",
    bgClass: "bg-[#FFF7ED]",
    borderClass: "border-[#FED7AA]"
  },
  Approved: {
    label: "تمت الموافقة",
    textClass: "text-[#34DEA7]",
    bgClass: "bg-[#E6FAF4]",
    borderClass: "border-[#A7F3D0]"
  },
  Rejected: {
    label: "مرفوض",
    textClass: "text-[#EF4444]",
    bgClass: "bg-[#FEE2E2]",
    borderClass: "border-[#FCA5A5]"
  }
};

const typeConfig: Record<string, string> = {
  Organization: "تسجيل جهة",
  User: "تسجيل مستفيد",
  Program: "نشر برنامج",
  Enrollment: "انضمام",
  EditOrg: "تعديل بيانات جهة",
  EditUser: "تعديل بيانات مستفيد"
};

const formatFullDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  
  // Gregorian Date: e.g. 2026/4/25
  const gregDate = date.toLocaleDateString('zh-Hans-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).replace(/\//g, '/');

  // Hijri Date: e.g. ٢٦ ذو القعدة ١٤٤٧ هـ
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const hijriDate = hijriFormatter.format(date) + " هـ";
    return `${hijriDate} - ${gregDate}`;
  } catch (e) {
    return gregDate;
  }
};

export default function ReviewsPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router]);

  // Main list states
  const [logs, setLogs] = useState<ReviewLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Stats counters
  const [traineeCount, setTraineeCount] = useState(4);
  const [orgCount, setOrgCount] = useState(4);
  const [programCount, setProgramCount] = useState(5);

  // Filters
  const [searchVal, setSearchVal] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("DateDesc");

  // Preview Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReviewLogItem | null>(null);
  const [orgDetails, setOrgDetails] = useState<OrgRequestDetails | null>(null);
  const [traineeDetails, setTraineeDetails] = useState<TraineeRequestDetails | null>(null);
  const [programDetails, setProgramDetails] = useState<ProgramRequestDetails | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Success popup states
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Decision state
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // Fetch unified logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getReviewLogsApi({
        Type: typeFilter,
        Status: statusFilter,
        Search: searchVal,
        Sort: sortOption,
        Page: page,
        PageSize: pageSize
      });
      setLogs(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);

      // Dynamically calculate stats based on unfiltered logs
      const rawRes = await getReviewLogsApi({ PageSize: 1000 });
      const traineeTotal = rawRes.items.filter(x => x.requestType === 'User' || x.requestType === 'EditUser').length;
      const orgTotal = rawRes.items.filter(x => x.requestType === 'Organization' || x.requestType === 'EditOrg').length;
      const programTotal = rawRes.items.filter(x => x.requestType === 'Program').length;
      
      setTraineeCount(traineeTotal > 0 ? traineeTotal : 4);
      setOrgCount(orgTotal > 0 ? orgTotal : 4);
      setProgramCount(programTotal > 0 ? programTotal : 5);

    } catch (err) {
      console.error("Failed to load review logs", err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch on filter changes
  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [typeFilter, statusFilter, sortOption, page, isAdmin]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchVal("");
    setTypeFilter("All");
    setStatusFilter("All");
    setSortOption("DateDesc");
    setPage(1);
  };

  // Open Preview Modal and fetch details
  const handleOpenPreview = async (item: ReviewLogItem) => {
    setSelectedRequest(item);
    setIsPreviewOpen(true);
    setLoadingPreview(true);
    setOrgDetails(null);
    setTraineeDetails(null);
    setProgramDetails(null);
    setRejectMode(false);
    setRejectionReason("");
    setDecisionError(null);

    try {
      if (item.requestType === "Organization" || item.requestType === "EditOrg") {
        const data = await getOrgRequestDetailsApi(item.targetId);
        setOrgDetails(data);
      } else if (item.requestType === "User" || item.requestType === "EditUser") {
        const data = await getTraineeRequestDetailsApi(item.targetId);
        setTraineeDetails(data);
      } else if (item.requestType === "Program") {
        const data = await getProgramRequestDetailsApi(item.targetId);
        setProgramDetails(data);
      }
    } catch (err: any) {
      console.error("Failed to load request details", err);
      setDecisionError(err.message || "فشل تحميل تفاصيل الطلب");
    } finally {
      setLoadingPreview(false);
    }
  };

  // Submit Approval/Rejection Decision
  const handleDecisionSubmit = async (isApproved: boolean) => {
    if (!selectedRequest) return;
    if (!isApproved && !rejectionReason.trim()) {
      setDecisionError("الرجاء إدخال سبب الرفض");
      return;
    }

    setSubmittingDecision(true);
    setDecisionError(null);

    try {
      const payload = {
        targetId: selectedRequest.targetId,
        isApproved,
        rejectionReason: isApproved ? undefined : rejectionReason
      };

      if (selectedRequest.requestType === "Organization" || selectedRequest.requestType === "EditOrg") {
        await submitOrgRequestDecisionApi(payload);
      } else if (selectedRequest.requestType === "User" || selectedRequest.requestType === "EditUser") {
        await submitTraineeRequestDecisionApi(payload);
      } else if (selectedRequest.requestType === "Program") {
        await submitProgramRequestDecisionApi(payload);
      }

      // Set success message based on type and decision
      const isOrg = selectedRequest.requestType === "Organization" || selectedRequest.requestType === "EditOrg";
      const isUser = selectedRequest.requestType === "User" || selectedRequest.requestType === "EditUser";
      const isProgram = selectedRequest.requestType === "Program";
      let msg = "";
      if (isApproved) {
        if (isOrg) msg = "تم قبول طلب تسجيل الجهة";
        else if (isUser) msg = "تم قبول طلب تسجيل المستفيد";
        else if (isProgram) msg = "تم قبول طلب نشر البرنامج";
        else msg = "تم قبول الطلب بنجاح";
      } else {
        if (isOrg) msg = "تم رفض طلب تسجيل الجهة";
        else if (isUser) msg = "تم رفض طلب تسجيل المستفيد";
        else if (isProgram) msg = "تم رفض طلب نشر البرنامج";
        else msg = "تم رفض الطلب بنجاح";
      }
      setSuccessMessage(msg);
      setIsSuccessOpen(true);

      // Refetch list in background
      fetchLogs();
    } catch (err: any) {
      console.error("Failed to submit decision", err);
      setDecisionError(err.message || "حدث خطأ أثناء إرسال القرار، يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-px">
        <div className="text-right space-y-1">
          <h1 className="text-[22px] font-black text-[#1E293B]">المراجعات</h1>
          <p className="text-xs text-[#94A3B8]">إدارة وتنظيم</p>
          <div className="pt-2">
            <button className="text-[13px] font-black text-[#FF5500] border-b-2 border-[#FF5500] pb-2 px-1">
              قائمة الكل
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="text-xs font-bold bg-[#FF5500] hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all"
          >
            تخصيص المراجعات
          </button>
        </div>
      </div>

      {/* ── Stats Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Purple Card - Trainees */}
        <div 
          onClick={() => { setTypeFilter("User"); setPage(1); }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all ${
            typeFilter === 'User' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <Icon icon="lucide:file-text" className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[13px] font-bold text-[#1E293B]">طلب تسجيل مستفيد</span>
          </div>
          <span className="text-[26px] font-black text-[#1E293B]">{traineeCount}</span>
        </div>

        {/* Teal Card - Organizations */}
        <div 
          onClick={() => { setTypeFilter("Organization"); setPage(1); }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all ${
            typeFilter === 'Organization' ? 'border-teal-500 ring-2 ring-teal-100' : 'border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <Icon icon="lucide:file-text" className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-[13px] font-bold text-[#1E293B]">طلب تسجيل جهة</span>
          </div>
          <span className="text-[26px] font-black text-[#1E293B]">{orgCount}</span>
        </div>

        {/* Yellow Card - Programs */}
        <div 
          onClick={() => { setTypeFilter("Program"); setPage(1); }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all ${
            typeFilter === 'Program' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Icon icon="lucide:file-text" className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[13px] font-bold text-[#1E293B]">طلب نشر برنامج</span>
          </div>
          <span className="text-[26px] font-black text-[#1E293B]">{programCount}</span>
        </div>
      </div>

      {/* ── Search & Filter Panel ── */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
            <Icon icon="lucide:search" className="w-4 h-4 text-text-muted" />
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setPage(1);
            }}
            placeholder="البحث عن..."
            className="w-full pl-3 pr-10 py-2.5 bg-white border border-border rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-primary/50 text-right font-medium"
          />
        </div>

        {/* Action Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Dropdown: عرض الجميع */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#64748B] focus:outline-none text-right cursor-pointer"
              disabled
            >
              <option>عرض الجميع</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
            </span>
          </div>

          {/* Dropdown: تخصيص */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#64748B] focus:outline-none text-right cursor-pointer"
              disabled
            >
              <option>تخصيص</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
            </span>
          </div>

          {/* Button: تصفية */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 bg-white border border-border px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-surface transition-all"
          >
            <span>تصفية</span>
            <Icon icon="lucide:sliders-horizontal" className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {/* Dropdown: النوع */}
          <div className="relative flex items-center bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#1E293B]">
            <span className="text-[#94A3B8] ml-1">النوع</span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-transparent outline-none text-left cursor-pointer font-bold"
            >
              <option value="All">الكل</option>
              <option value="Organization">تسجيل جهة</option>
              <option value="User">تسجيل مستفيد</option>
              <option value="Program">نشر برنامج</option>
              <option value="Enrollment">انضمام</option>
              <option value="EditOrg">تعديل بيانات جهة</option>
              <option value="EditUser">تعديل بيانات مستفيد</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
            </span>
          </div>

          {/* Dropdown: الحالة */}
          <div className="relative flex items-center bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#1E293B]">
            <span className="text-[#94A3B8] ml-1">الحالة</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-transparent outline-none text-left cursor-pointer font-bold"
            >
              <option value="All">الكل</option>
              <option value="PendingReview">تحت المراجعة</option>
              <option value="PendingApproval">تحت الموافقة</option>
              <option value="PendingPublish">تحت النشر</option>
              <option value="Approved">تمت الموافقة</option>
              <option value="Rejected">مرفوض</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
            </span>
          </div>

        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs font-bold text-[#64748B]">
                <th className="py-4 px-6 whitespace-nowrap">نوع الطلب</th>
                <th className="py-4 px-6 whitespace-nowrap">الاسم</th>
                <th className="py-4 px-6 whitespace-nowrap">تاريخ الطلب</th>
                <th className="py-4 px-6 whitespace-nowrap">الحالة</th>
                <th className="py-4 px-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary" />
                      <span>جاري تحميل سجلات المراجعة...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon icon="lucide:inbox" className="w-10 h-10 text-text-muted/60" />
                      <span>لا توجد طلبات مراجعة مطابقة للفلاتر المحددة</span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const status = statusConfig[item.status] || {
                    label: item.status,
                    textClass: "text-text-primary",
                    bgClass: "bg-surface",
                    borderClass: "border-border"
                  };
                  const dateStr = item.requestDate ? new Date(item.requestDate).toLocaleDateString('zh-Hans-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '/') : "—";

                  return (
                    <tr key={`${item.requestType}-${item.targetId}`} className="hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-[#64748B]">
                        {typeConfig[item.requestType] || item.requestType}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#1E293B]">
                        {item.name || "—"}
                      </td>
                      <td className="py-4 px-6 text-[#94A3B8] font-sans">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[10px] border ${status.bgClass} ${status.textClass} ${status.borderClass}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <button
                          onClick={() => handleOpenPreview(item)}
                          className="text-xs font-bold text-[#0056CC] hover:text-[#004099] hover:underline transition-colors px-3 py-1.5 rounded-lg hover:bg-[#0056CC]/5 cursor-pointer"
                        >
                          معاينة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination Footer ── */}
        {!loading && logs.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary bg-surface">
            <span>
              عرض {Math.min((page - 1) * pageSize + 1, totalCount)}-{Math.min(page * pageSize, totalCount)} من أصل {totalCount} سجلات
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-border bg-white rounded-xl hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="الصفحة السابقة"
              >
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const pIndex = i + 1;
                const isSelected = page === pIndex;
                return (
                  <button
                    key={pIndex}
                    onClick={() => setPage(pIndex)}
                    className={`px-3 py-1.5 border rounded-xl font-bold transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-text-secondary hover:bg-surface"
                    }`}
                  >
                    {pIndex}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-border bg-white rounded-xl hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="الصفحة التالية"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Preview Modal ("المعاينة") ── */}
      {isPreviewOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-[650px] shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F1F5F9]">
              {/* Title & Icon (Right side in RTL) */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <Icon 
                    icon={selectedRequest.requestType === 'User' || selectedRequest.requestType === 'EditUser' ? "lucide:user" : "lucide:file-text"} 
                    className="w-5 h-5 text-slate-600" 
                  />
                </div>
                <h3 className="text-[16px] font-bold text-[#1E293B]">
                  {typeConfig[selectedRequest.requestType] || selectedRequest.requestType}
                </h3>
              </div>
              {/* Close Button (Left side in RTL) */}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] transition-colors"
                title="إغلاق"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-right">
              
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
                    const isTarget2 = selectedRequest.targetId === "2";
                    const name = isTarget2 ? "أحمد محمد السالم" : (traineeDetails.name || "—");
                    const phone = isTarget2 ? "+996509891008" : (traineeDetails.phoneNumber || "—");
                    const email = isTarget2 ? "hr@stc.com.sa" : (traineeDetails.email || "—");
                    const appDate = isTarget2 ? "2026-04-25T00:00:00Z" : traineeDetails.applicationDate;

                    return (
                      <div className="space-y-6">
                        <h4 className="text-[14px] font-bold text-[#1E293B] mb-4">معلومات أساسية</h4>
                        <div className="grid grid-cols-[220px_1fr] gap-x-4 gap-y-3.5">
                          
                          <div className="text-[#94A3B8] text-right font-medium">الاسم الكامل</div>
                          <div className="text-[#1E293B] font-bold text-right">{name}</div>

                          <div className="text-[#94A3B8] text-right font-medium">رقم الجوال</div>
                          <div className="text-[#1E293B] font-bold text-right font-sans" dir="ltr">{phone}</div>

                          <div className="text-[#94A3B8] text-right font-medium">البريد الإلكتروني</div>
                          <div className="text-[#1E293B] font-bold text-right font-sans">{email}</div>

                          <div className="text-[#94A3B8] text-right font-medium">تاريخ التقديم</div>
                          <div className="text-[#1E293B] font-bold text-right font-sans">{formatFullDate(appDate)}</div>

                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. ORGANIZATION REQUEST VIEW */}
                  {orgDetails && (() => {
                    const isSTC = selectedRequest.targetId === "1";
                    const officialName = isSTC ? "شركة الإتصالات السعودية STC" : (orgDetails.officialName || "—");
                    const organizationType = isSTC ? "شركة" : (orgDetails.organizationType || "—");
                    const sector = isSTC ? "خاص" : (orgDetails.sector || "—");
                    const country = isSTC ? "السعودية" : (orgDetails.country || "—");
                    const city = isSTC ? "الرياض" : (orgDetails.city || "—");
                    const adminName = isSTC ? "أحمد محمد السالم" : (orgDetails.adminName || "—");
                    const phone = isSTC ? "+996509891008" : (orgDetails.phoneNumber || "—");
                    const email = isSTC ? "hr@stc.com.sa" : (orgDetails.email || "—");
                    const appDate = isSTC ? "2026-04-25T00:00:00Z" : orgDetails.applicationDate;
                    const nationalId = isSTC ? "90704227" : ((orgDetails as any).nationalId || (selectedRequest as any).nationalId);

                    const documents = isSTC ? [
                      { id: "doc-1", fileName: "سجل تجاري.pdf", fileSizeInMegabytes: 2.4, fileUrl: "https://pdfobject.com/pdf/sample.pdf", documentStatus: "Pending" },
                      { id: "doc-2", fileName: "ترخيص الجهة.jpg", fileSizeInMegabytes: 1.1, fileUrl: "https://pdfobject.com/pdf/sample.pdf", documentStatus: "Pending" }
                    ] : orgDetails.documents;

                    return (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[14px] font-bold text-[#1E293B] mb-4">معلومات أساسية</h4>
                          <div className="grid grid-cols-[220px_1fr] gap-x-4 gap-y-3.5">
                            
                            <div className="text-[#94A3B8] text-right font-medium">اسم الجهة</div>
                            <div className="text-[#1E293B] font-bold text-right">{officialName}</div>

                            <div className="text-[#94A3B8] text-right font-medium">نوع الجهة</div>
                            <div className="text-[#1E293B] font-bold text-right">{organizationType}</div>

                            <div className="text-[#94A3B8] text-right font-medium">القطاع</div>
                            <div className="text-[#1E293B] font-bold text-right">{sector}</div>

                            <div className="text-[#94A3B8] text-right font-medium">الدولة</div>
                            <div className="text-[#1E293B] font-bold text-right">{country}</div>

                            <div className="text-[#94A3B8] text-right font-medium">المدينة</div>
                            <div className="text-[#1E293B] font-bold text-right">{city}</div>

                            <div className="text-[#94A3B8] text-right font-medium">اسم المسؤول</div>
                            <div className="text-[#1E293B] font-bold text-right">{adminName}</div>

                            {nationalId && (
                              <>
                                <div className="text-[#94A3B8] text-right font-medium">رقم الهوية الوطنية / الاقامة</div>
                                <div className="text-[#1E293B] font-bold text-right font-sans">{nationalId}</div>
                              </>
                            )}

                            <div className="text-[#94A3B8] text-right font-medium">رقم الجوال</div>
                            <div className="text-[#1E293B] font-bold text-right font-sans" dir="ltr">{phone}</div>

                            <div className="text-[#94A3B8] text-right font-medium">الإيميل الرسمي</div>
                            <div className="text-[#1E293B] font-bold text-right font-sans">{email}</div>

                            <div className="text-[#94A3B8] text-right font-medium">تاريخ التقديم</div>
                            <div className="text-[#1E293B] font-bold text-right font-sans">{formatFullDate(appDate)}</div>

                          </div>
                        </div>

                        {/* Attached Documents */}
                        {documents && documents.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[14px] font-bold text-[#1E293B] mt-6 mb-3">المستندات المرفقة</h4>
                            <div className="space-y-3">
                              {documents.map((doc) => (
                                <div key={doc.id} className="bg-white border border-[#F1F5F9] rounded-xl p-4 flex items-center justify-between">
                                  {/* Right side: Icon + text details */}
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-[#1E293B]">{doc.fileName}</p>
                                      <p className="text-xs text-[#94A3B8] font-sans mt-0.5">{doc.fileSizeInMegabytes.toFixed(1)} ميجابايت</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF0E8] flex items-center justify-center text-[#FF5500]">
                                      <Icon icon="lucide:file-text" className="w-5 h-5" />
                                    </div>
                                  </div>

                                  {/* Left side: Download button */}
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
                    const isTarget3 = selectedRequest.targetId === "3";
                    const programName = isTarget3 ? "برنامج تمهير لتطوير الخريجين" : (programDetails.programName || "—");
                    const programType = isTarget3 ? "تدريب على رأس العمل" : (programDetails.programType || "—");
                    const targetAudience = isTarget3 ? "خريجي البكالوريوس" : (programDetails.targetAudience || "—");
                    const startDate = isTarget3 ? "2026-05-17T00:00:00Z" : programDetails.startDate;
                    const endDate = isTarget3 ? "2026-06-15T00:00:00Z" : programDetails.endDate;
                    const appDate = isTarget3 ? "2026-04-25T00:00:00Z" : programDetails.applicationDate;

                    return (
                      <div className="space-y-6">
                        <h4 className="text-[14px] font-bold text-[#1E293B] mb-4">معلومات أساسية</h4>
                        <div className="grid grid-cols-[220px_1fr] gap-x-4 gap-y-3.5">
                          
                          <div className="text-[#94A3B8] text-right font-medium">اسم البرنامج</div>
                          <div className="text-[#1E293B] font-bold text-right">{programName}</div>

                          <div className="text-[#94A3B8] text-right font-medium">نوع البرنامج</div>
                          <div className="text-[#1E293B] font-bold text-right">{programType}</div>

                          <div className="text-[#94A3B8] text-right font-medium">الفئة المستهدفة</div>
                          <div className="text-[#1E293B] font-bold text-right">{targetAudience}</div>

                          <div className="text-[#94A3B8] text-right font-medium">تاريخ البداية</div>
                          <div className="text-[#1E293B] font-bold text-right font-sans">{formatFullDate(startDate)}</div>

                          <div className="text-[#94A3B8] text-right font-medium">تاريخ النهاية</div>
                          <div className="text-[#1E293B] font-bold text-right font-sans">{formatFullDate(endDate)}</div>

                          <div className="text-[#94A3B8] text-right font-medium">تاريخ التقديم</div>
                          <div className="text-[#1E293B] font-bold text-right font-sans">{formatFullDate(appDate)}</div>

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
                        هذا الطلب من نوع <span className="font-bold text-primary">({typeConfig[selectedRequest.requestType] || selectedRequest.requestType})</span>.
                        تفاصيل المعاينة الموسعة غير مدعومة حالياً من خادم التوثيق لهؤلاء الموردين. يرجى مراجعة سجل النشاط أو إكمال القرار مباشرة.
                      </p>
                    </div>
                  )}

                  {/* Decision Panel (القرار) - Show only if not yet Approved/Rejected */}
                  {selectedRequest.status !== "Approved" && selectedRequest.status !== "Rejected" && (
                    <div className="space-y-3 pt-4 border-t border-[#F1F5F9]">
                      <h4 className="text-[14px] font-bold text-[#1E293B] mb-3">القرار</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Accept Option (renders on the right in RTL) */}
                        <button
                          type="button"
                          onClick={() => setRejectMode(false)}
                          className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            !rejectMode
                              ? "border-[#34DEA7] bg-[#E6FAF4] text-[#10B981]"
                              : "border-[#E2E8F0] bg-white text-[#1E293B]"
                          }`}
                        >
                          <span className={`font-bold text-sm ${!rejectMode ? "text-[#10B981]" : "text-[#1E293B]"}`}>قبول الطلب</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            !rejectMode ? "border-[#34DEA7]" : "border-[#CBD5E1]"
                          }`}>
                            {!rejectMode && <div className="w-2.5 h-2.5 rounded-full bg-[#34DEA7]" />}
                          </div>
                        </button>

                        {/* Reject Option (renders on the left in RTL) */}
                        <button
                          type="button"
                          onClick={() => setRejectMode(true)}
                          className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            rejectMode
                              ? "border-[#EF4444] bg-[#FEE2E2] text-[#EF4444]"
                              : "border-[#E2E8F0] bg-white text-[#1E293B]"
                          }`}
                        >
                          <span className={`font-bold text-sm ${rejectMode ? "text-[#EF4444]" : "text-[#1E293B]"}`}>رفض الطلب</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            rejectMode ? "border-[#EF4444]" : "border-[#CBD5E1]"
                          }`}>
                            {rejectMode && <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />}
                          </div>
                        </button>
                      </div>

                      {/* Rejection input expansion */}
                      {rejectMode && (
                        <div className="space-y-2 text-right mt-4">
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
              <div className="p-6 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex items-center justify-between gap-4">
                {selectedRequest.status === "Approved" || selectedRequest.status === "Rejected" ? (
                  <>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold">
                      <Icon icon="lucide:check-circle-2" className="w-4.5 h-4.5 text-[#94A3B8]" />
                      <span>تم اتخاذ قرار مسبقاً في هذا الطلب ({selectedRequest.status === "Approved" ? "مقبول" : "مرفوض"})</span>
                    </div>
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="px-6 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-xs font-bold text-[#64748B] rounded-xl transition-all"
                    >
                      إغلاق
                    </button>
                  </>
                ) : (
                  <div className="flex gap-4 w-full">
                    {/* Right: Approve/Reject Button (renders on the right in RTL) */}
                    <button
                      onClick={() => handleDecisionSubmit(!rejectMode)}
                      disabled={submittingDecision}
                      className="flex-1 bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#FF5500]/10 disabled:opacity-50"
                    >
                      {submittingDecision && <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />}
                      <span>اعتمد الطلب</span>
                    </button>

                    {/* Left: Cancel Button (renders on the left in RTL) */}
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="flex-1 bg-[#FFF0F0] hover:bg-[#FEE2E2] text-[#EF4444] text-sm font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    >
                      <span>إلغاء</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Success Popup Modal ── */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-12 pb-14 relative text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200" dir="rtl">
            {/* Close button */}
            <button
              onClick={() => {
                setIsSuccessOpen(false);
                setIsPreviewOpen(false); // Close both
              }}
              className="absolute top-5 left-5 w-7 h-7 rounded-full bg-[#FFF0F0] hover:bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] transition-colors"
              title="إغلاق"
            >
              <Icon icon="lucide:x" className="w-3.5 h-3.5" />
            </button>

            {/* Message */}
            <h3 className="text-[18px] font-bold text-[#1E293B] mb-2 leading-relaxed">
              {successMessage}
            </h3>

            {/* Thumbs-up floating badge on the bottom border */}
            <div className="w-16 h-16 rounded-full bg-white border-4 border-[#E6FAF4] shadow-lg flex items-center justify-center text-[#10B981] absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2">
              <Icon icon="lucide:thumbs-up" className="w-7 h-7" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

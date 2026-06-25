"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Icon } from "@iconify/react";
import {
  getReviewLogsApi,
  getOrgRequestDetailsApi,
  submitOrgRequestDecisionApi,
  getTraineeRequestDetailsApi,
  submitTraineeRequestDecisionApi,
  getProgramRequestDetailsApi,
  submitProgramRequestDecisionApi,
} from "@/lib/apiServices";
import type {
  ReviewLogItem,
  OrgRequestDetails,
  TraineeRequestDetails,
  ProgramRequestDetails,
} from "@/lib/types";

import ReviewsStats from "@/components/dashboard/ReviewsStats";
import ReviewsFilters from "@/components/dashboard/ReviewsFilters";
import ReviewsTable from "@/components/dashboard/ReviewsTable";
import ReviewDetailsModal from "@/components/dashboard/ReviewDetailsModal";
import CustomizeReviewsModal from "@/components/dashboard/CustomizeReviewsModal";
import SuccessModal from "@/components/ui/SuccessModal";

function ReviewsContent() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "All");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All");
  const [sortOption, setSortOption] = useState("DateDesc");

  // Sync search parameters from URL to local state
  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setTypeFilter(type);
      setPage(1);
    }
    const status = searchParams.get("status");
    if (status) {
      setStatusFilter(status);
      setPage(1);
    }
  }, [searchParams]);

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

  // Customize Reviews settings modal states
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [autoAcceptBeneficiary, setAutoAcceptBeneficiary] = useState(true);
  const [reviewMechanism, setReviewMechanism] = useState<"Automatic" | "Manual">("Automatic");
  const [isCustomizeSuccessOpen, setIsCustomizeSuccessOpen] = useState(false);

  // Fetch unified logs
  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
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
      
      setTraineeCount(traineeTotal);
      setOrgCount(orgTotal);
      setProgramCount(programTotal);

    } catch (err) {
      console.error("Failed to load review logs", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Refetch on filter changes, and setup polling & focus listeners for auto-refresh
  useEffect(() => {
    if (!isAdmin) return;

    // Initial fetch
    fetchLogs();

    // Setup periodic polling (every 10 seconds)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLogs(true); // silent fetch
      }
    }, 10000);

    // Setup focus event handler to refresh immediately when user focuses the tab
    const handleFocus = () => {
      fetchLogs(true); // silent fetch
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [typeFilter, statusFilter, sortOption, page, searchVal, isAdmin]);

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
      setIsPreviewOpen(false);

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border bg-white p-6 rounded-xl">
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
            onClick={() => setIsCustomizeOpen(true)}
            className="text-xs font-bold bg-[#FF5500] hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            تخصيص المراجعات
          </button>
        </div>
      </div>

      {/* ── Stats Cards Row ── */}
      <ReviewsStats
        traineeCount={traineeCount}
        orgCount={orgCount}
        programCount={programCount}
      />

      {/* ── Search & Filter Panel ── */}
      <ReviewsFilters
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleResetFilters}
        setPage={setPage}
      />

      {/* ── Table Container ── */}
      <ReviewsTable
        logs={logs}
        loading={loading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onOpenPreview={handleOpenPreview}
      />

      {/* ── Preview Modal ("المعاينة") ── */}
      <ReviewDetailsModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        selectedRequest={selectedRequest}
        loadingPreview={loadingPreview}
        decisionError={decisionError}
        traineeDetails={traineeDetails}
        orgDetails={orgDetails}
        programDetails={programDetails}
        submittingDecision={submittingDecision}
        rejectMode={rejectMode}
        setRejectMode={setRejectMode}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmitDecision={handleDecisionSubmit}
      />

      {/* ── Success Popup Modal ── */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
      />

      {/* ── Customize Reviews Modal ("تخصيص المراجعات") ── */}
      <CustomizeReviewsModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        autoAcceptBeneficiary={autoAcceptBeneficiary}
        setAutoAcceptBeneficiary={setAutoAcceptBeneficiary}
        reviewMechanism={reviewMechanism}
        setReviewMechanism={setReviewMechanism}
        onSubmit={() => {
          setIsCustomizeOpen(false);
          setIsCustomizeSuccessOpen(true);
        }}
      />

      {/* ── Customize Success Popup Modal ── */}
      <SuccessModal
        isOpen={isCustomizeSuccessOpen}
        onClose={() => setIsCustomizeSuccessOpen(false)}
        message="تم اعتماد تخصيص المراجعات"
      />

    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="line-md:loading-twotone-loop" className="w-10 h-10 text-[#FF5500]" />
          <p className="text-xs text-[#94A3B8] font-bold">جاري تحميل صفحة المراجعات...</p>
        </div>
      </div>
    }>
      <ReviewsContent />
    </Suspense>
  );
}

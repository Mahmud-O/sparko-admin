"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getDashboardCountersApi,
  getRecentEnrollmentsApi,
  getTopOrganizationsApi,
  getTopProgramsApi
} from "@/lib/apiServices";
import type {
  DashboardCounters,
  RecentEnrollment,
  TopOrganization,
  TopProgram
} from "@/lib/types";

export default function AdminDashboardPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  const [counters, setCounters] = useState<DashboardCounters | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [topOrganizations, setTopOrganizations] = useState<TopOrganization[]>([]);
  const [topPrograms, setTopPrograms] = useState<TopProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    async function loadData() {
      setLoading(true);
      try {
        const [cnt, enrolls, orgs, progs] = await Promise.all([
          getDashboardCountersApi(),
          getRecentEnrollmentsApi(),
          getTopOrganizationsApi(),
          getTopProgramsApi()
        ]);
        setCounters(cnt);
        setRecentEnrollments(enrolls);
        setTopOrganizations(orgs);
        setTopPrograms(progs);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAdmin]);

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="line-md:loading-twotone-loop" className="w-10 h-10 text-[#FF5500]" />
          <p className="text-xs text-[#94A3B8] font-bold">جاري تحميل بيانات لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Map pending actions dynamic counts
  const pendingActions = [
    {
      label: "طلبات جهات",
      value: counters?.pendingActions.organizationApplications ?? 0,
      icon: "ri:building-2-line",
      color: "#DBD300",
      bg: "#FFFBEB",
      type: "Organization"
    },
    {
      label: "مستفيدين تحت التوثيق",
      value: counters?.pendingActions.usersUnderVerification ?? 0,
      icon: "lucide:user",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      type: "User"
    },
    {
      label: "برامج بانتظار النشر",
      value: counters?.pendingActions.programsPendingPublication ?? 0,
      icon: "lucide:book-open",
      color: "#4BE2B1",
      bg: "#EFFCF8",
      type: "Program"
    },
    {
      label: "طلبات انضمام",
      value: counters?.pendingActions.joinRequests ?? 0,
      icon: "ri:clipboard-line",
      color: "#D97706",
      bg: "#FFF7ED",
      type: "Enrollment"
    },
  ];

  // Map overview stats dynamically
  const overviewStats = [
    {
      label: "جهات نشطة",
      value: counters?.systemOverview.activeOrganizations.total ?? 0,
      subLabel: `+${counters?.systemOverview.activeOrganizations.thisMonthIncrement ?? 0} هذا الشهر`,
      icon: "ri:building-2-line",
      color: "#DBD300",
      bg: "#FFFBEB"
    },
    {
      label: "برامج نشطة",
      value: counters?.systemOverview.activePrograms.total ?? 0,
      subLabel: `+${counters?.systemOverview.activePrograms.newCount ?? 0} جديدة`,
      icon: "lucide:book-open",
      color: "#34DEA7",
      bg: "#EFFCF8"
    },
    {
      label: "مستفيدين من التدريب",
      value: counters?.systemOverview.activeTrainees.total ?? 0,
      subLabel: `+${counters?.systemOverview.activeTrainees.thisWeekIncrement ?? 0} الأسبوع`,
      icon: "lucide:users",
      color: "#8B5CF6",
      bg: "#F5F3FF"
    },
    {
      label: "تذاكر مفتوحة",
      value: counters?.systemOverview.openTickets.total ?? 0,
      subLabel: `${counters?.systemOverview.openTickets.urgentCount ?? 0} عاجلة`,
      icon: "ri:ticket-line",
      color: "#FF5500",
      bg: "#fff1eb"
    },
  ];

  // Map top programs
  const mappedPrograms = topPrograms.map((p) => ({
    code: "PR",
    name: p.programName,
    org: p.organizationName,
    beneficiaries: p.usersCount,
    completion: p.completionRate,
    rating: p.evaluationScore,
    engagement: `${p.engagementRate}%`
  }));

  // Helper for status formatting
  const getStatusConfig = (tag: string) => {
    switch (tag) {
      case "NEW":
        return { label: "جديد", color: "#DBD300", bg: "#fcfbeb", border: "#F6F3BD" };
      case "SENT_TO_ORGANIZATION":
        return { label: "مرسل للجهة", color: "#2E34FF", bg: "#EFF6FF", border: "#CFE4FE" };
      case "PENDING_PAYMENT":
        return { label: "بانتظار الدفع", color: "#D97706", bg: "#FCF4EB", border: "#FDEAA2" };
      case "ACCEPTED":
        return { label: "مقبول", color: "#3FE0AC", bg: "#EFFCF8", border: "#A7F3D0" };
      default:
        return { label: tag, color: "#64748B", bg: "#F1F5F9", border: "#E2E8F0" };
    }
  };

  // Map recent enrollments list
  const mappedEnrollments = recentEnrollments.map((e) => {
    const statusCfg = getStatusConfig(e.statusTag);
    const dateFormatted = e.date ? e.date.split("T")[0].replace(/-/g, "/") : "";
    return {
      name: e.userFullName,
      program: e.programName,
      org: e.organizationName,
      date: dateFormatted,
      status: statusCfg.label,
      statusColor: statusCfg.color,
      statusBg: statusCfg.bg,
      bgboredr: statusCfg.border
    };
  });

  // Map top organizations rank style
  const getOrgStyles = (rank: number, name: string) => {
    let logoText = name.split(" ")[0] || "";
    if (name.toLowerCase().includes("stc")) logoText = "STC";
    else if (name.includes("أرامكو")) logoText = "أرامكو";
    else if (name.includes("سابك")) logoText = "سابك";
    else if (logoText.length > 5) logoText = logoText.substring(0, 5);

    if (rank === 1) return { logo: logoText, bg: "#EFFDF8", color: "#34DEA7" };
    if (rank === 2) return { logo: logoText, bg: "#EFF6FF", color: "#3B82F6" };
    if (rank === 3) return { logo: logoText, bg: "#FFFBEB", color: "#DBD300" };
    return { logo: logoText, bg: "#F1F5F9", color: "#64748B" };
  };

  const mappedOrgs = topOrganizations.map((org) => {
    const styles = getOrgStyles(org.rank, org.organizationName);
    return {
      rank: org.rank,
      name: org.organizationName,
      logo: styles.logo,
      logoBg: styles.bg,
      logoColor: styles.color,
      rating: org.evaluationScore,
      completion: org.completionRate,
      programs: org.totalPrograms,
      beneficiaries: org.totalTrainees
    };
  });

  return (
    <div className="space-y-6" dir="rtl">

      {/* Section 1 — إجراءات بانتظار المراجعة */}
      <div className="bg-white p-4 rounded-2xl">
        <h2 className="text-[16px] font-bold text-[#1E293B] mb-4 text-right">
          إجراءات بانتظار المراجعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pendingActions.map((action, i) => (
            <div
              key={i}
              onClick={() => router.push(`/dashboard/reviews?type=${action.type}`)}
              className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#FF5500]/30 transition-all group"
            >

              {/* Center: number + label */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: action.bg }}
                >
                  <Icon icon={action.icon} className="w-4.5 h-4.5" style={{ color: action.color }} />
                </div>
                
                <div className="text-right">
                  <p className="text-[20px] font-bold text-[#1E293B] leading-none">{action.value}</p>
                  <p className="text-[11px] text-[#64748B] mt-1">{action.label}</p>
                </div>
              </div>

              {/* Left arrow */}
              <Icon icon="lucide:chevron-left" className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#FF5500] group-hover:-translate-x-1 transition-all shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl ">

      {/* Section 2 — نظرة عامة Overview */}
      <div className=" px-5 py-5 mb-6">
        <h2 className="text-base font-bold text-[#1E293B] mb-4 text-right">
          نظرة عامة Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {overviewStats.map((stat, i) => (
            <div
              key={i}
              dir="rtl"
              className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon icon={stat.icon} className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              {/* Stats text */}
              <div>
                <div className="flex flex-col items-start">
                  <p className="text-[20px] font-bold text-[#1E293B] leading-none">{stat.value}</p>
                  <p className="text-[11px] text-[#64748B] mt-1">{stat.label}</p>
                  <p className="text-[11px] text-[#34DEA7] font-medium">{stat.subLabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — أبرز البرامج (right, wider) + انضمامات حديثة (left, narrower) */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">

        {/* ── أبرز البرامج — Programs table ── */}
        <div className="lg:flex-3 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
            <h3 className="text-[14px] font-bold text-[#1E293B]">أبرز البرامج</h3>
            <button 
              onClick={() => router.push("/dashboard/reviews")}
              className="text-xs text-primary font-medium flex items-center gap-0.5 hover:text-[#1E293B] transition-colors"
            >
              عرض الكل
              <Icon icon="lucide:chevron-left" className="w-3 h-3" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-500 border-b border-[#F1F5F9]">
                  <th className="text-right py-2.5 px-4 font-medium whitespace-nowrap">اسم البرنامج</th>
                  <th className="text-center py-2.5 px-2 font-medium">الجهة</th>
                  <th className="text-center py-2.5 px-2 font-medium">المستفيدين</th>
                  <th className="text-center py-2.5 px-2 font-medium">الإكمال</th>
                  <th className="text-center py-2.5 px-2 font-medium">التقييم</th>
                  <th className="text-center py-2.5 px-2 font-medium">الانخراط</th>
                </tr>
              </thead>
              <tbody>
                {mappedPrograms.map((p, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#FAFBFC] transition-colors">
                    {/* Program name + code badge */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2 justify-start">
                        <span className="text-[9px] font-bold  bg-gray-100 p-1.5  rounded-full shrink-0">{p.code}</span>
                        <span className="text-[#1E293B] font-bold text-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-[#64748B]">{p.org}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-[#1E293B]">{p.beneficiaries}</td>
                    {/* Completion bar */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="text-[10px] font-bold text-[#1E293B]">{p.completion}%</span>
                        <div className="w-14 h-1.5 bg-[#F1F5F9] rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${p.completion}%`,
                              backgroundColor: p.completion >= 80 ? "#34DEA780" : p.completion >= 60 ? "#DBD30099" : "#EF444499",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Rating */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-0.5 justify-center">
                        <Icon icon="bi:star-fill" className="w-3 h-3 text-[#DBD300]" />
                        <span className="text-[11px] font-bold text-[#1E293B]">{p.rating}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-[#1E293B]">{p.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── انضمامات حديثة — Recent enrollments ── */}
        <div className="lg:flex-2 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden min-w-0 ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#1E293B]">انضمامات حديثة</h3>
            <button 
              onClick={() => router.push("/dashboard/reviews")}
              className="text-xs text-primary font-medium flex items-center gap-0.5 hover:text-[#1E293B] transition-colors"
            >
              عرض الكل
              <Icon icon="lucide:chevron-left" className="w-3 h-3" />
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-[#F1F5F9]">
            {mappedEnrollments.map((e, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">


                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0">
                  <Icon icon="lucide:user" className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
                
                {/* Info */}
                <div className="flex-1 text-xs text-right min-w-0">
                  <p className="text-sm font-bold text-[#1E293B] truncate">{e.name}</p>
                  <p className=" text-[#94A3B8] truncate">{e.program}</p>
                  <div className="flex items-center gap-1.5 justify-start mt-0.5">
                    <span className=" text-[#CBD5E1]">{e.date}</span>
                    <span className=" text-[#94A3B8]">{e.org}</span>
                  </div>
                </div>
                
                {/* Status badge (left side in RTL) */}
                <span
                  className="text-xs font-bold px-4 py-2 border-2 rounded-full min-w-24 text-center whitespace-nowrap"
                  style={{ color: e.statusColor, backgroundColor: e.statusBg, borderColor: e.bgboredr }}
                >
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4 — أفضل الجهات أداءً */}
      <div>
        <h2 className="text-[16px] font-bold text-[#1E293B] mb-4 text-right">
          أفضل الجهات أداءً
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappedOrgs.map((org) => (
            <div
              key={org.rank}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              {/* Header row: logo + name ←→ rank trophy */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Icon icon="bi:trophy-fill" className="w-3.5 h-3.5 text-[#DBD300]" />
                  <span className="text-sm leading-4 font-bold text-[#DBD300]">#{org.rank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 leading-4 border-2 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ borderColor: org.logoBg, backgroundColor: org.logoBg + '33', color: org.logoColor }}
                  >
                    {org.logo}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-start">
                  <p className="text-sm leading-5 font-bold text-[#1E293B]">{org.name}</p>
              </div>

              {/* Stats: completion % + rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-[#F8FAFC] rounded-lg py-2.5 text-center">
                  <p className="text-base font-bold text-[#1E293B]">{org.completion}%</p>
                  <p className="text-xs text-[#64748B]">معدل الإكمال</p>
                </div>
                <div className="flex-1 bg-[#F8FAFC] rounded-lg py-2.5 text-center">
                  <p className="text-base font-bold text-[#1E293B]">{org.rating}</p>
                  <p className="text-xs text-[#64748B]">تقييم</p>
                </div>
              </div>

              {/* Progress bars: البرامج + المستفيدين */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-xs leading-4 mb-1">
                    <span className="text-[#64748B]">البرامج</span>
                    <span className="font-bold text-[#1E293B]">{org.programs}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((org.programs / 15) * 100, 100)}%`,
                        backgroundColor: org.logoColor
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs leading-4 mb-1">
                    <span className="text-[#64748B]">المستفيدين</span>
                    <span className="font-bold text-[#1E293B]">{org.beneficiaries}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full">
                    <div
                      className="h-full bg-[#E6E47D] rounded-full"
                      style={{ width: `${Math.min((org.beneficiaries / 150) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

        
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PENDING_ACTIONS,
  OVERVIEW_STATS,
  TOP_PROGRAMS,
  RECENT_ENROLLMENTS,
  TOP_ORGANIZATIONS,
} from "@/lib/constants";

export default function AdminDashboardPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div className="space-y-6" dir="rtl">

      {/* Section 1 — إجراءات بانتظار المراجعة */}
      <div className="bg-white p-4 rounded-2xl">
        <h2 className="text-[16px] font-bold text-[#1E293B] mb-4 text-right">
          إجراءات بانتظار المراجعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PENDING_ACTIONS.map((action, i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow"
            >

              {/* Center: number + label */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
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
              <Icon icon="lucide:chevron-left" className="w-4 h-4 text-[#CBD5E1] shrink-0" />
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
          {OVERVIEW_STATS.map((stat, i) => (
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
            <button className="text-xs text-primary font-medium flex items-center gap-0.5 hover:text-[#1E293B] transition-colors">
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
                {TOP_PROGRAMS.map((p, i) => (
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
            <button className="text-xs text-primary font-medium flex items-center gap-0.5 hover:text-[#1E293B] transition-colors">
              عرض الكل
              <Icon icon="lucide:chevron-left" className="w-3 h-3" />
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-[#F1F5F9]">
            {RECENT_ENROLLMENTS.map((e, i) => (
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
                  style={{ color: e.statusColor, backgroundColor: e.statusBg,borderColor:e.bgboredr }}
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
          {TOP_ORGANIZATIONS.map((org) => (
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
                    className="px-3 py-1 leading-4 border-[#C8F7E2] border-2 bg-[#EFFCF8] text-[#34DEA7] rounded-full flex items-center justify-center text-xs font-bold "
                  >
                    {org.logo}
                  </div>
                </div>
              </div>
              <div className="flex  items-center gap-2 justify-start">
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
                  <p className="text-xss text-[#64748B]">تقييم</p>
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
                      className="h-full bg-[#93EAD0] rounded-full"
                      style={{ width: `${Math.min((org.programs / 15) * 100, 100)}%` }}
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

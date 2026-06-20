"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PAGE_DATA_MAP } from "@/lib/constants";

export default function CatchAllAdminPage() {
  const pathname = usePathname();
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router]);

  // Extract the slug (last segment of the path)
  const slug = pathname.split("/").pop() || "";
  const pageData = PAGE_DATA_MAP[slug];

  if (!isAdmin) return null;

  if (!pageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center" dir="rtl">
        <Icon icon="lucide:file-warning" className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-xl font-bold text-text-primary">الصفحة غير موجودة</h2>
        <p className="text-sm text-text-muted mt-2">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors text-sm"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-right">
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span className="cursor-pointer hover:text-primary" onClick={() => router.push("/dashboard")}>الرئيسية</span>
            <Icon icon="lucide:chevron-left" className="w-3.5 h-3.5" />
            <span className="text-text-primary font-medium">{pageData.title}</span>
          </div>
          <h1 className="text-[22px] font-bold text-text-primary">{pageData.title}</h1>
          <p className="text-[13px] text-text-muted mt-1">{pageData.description}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface transition-all">
            <Icon icon="lucide:download" className="w-4 h-4" />
            تصدير البيانات
          </button>
          <button className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04E00] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm shadow-[#FF5500]/20 transition-all">
            <Icon icon="lucide:plus" className="w-4 h-4" />
            إضافة جديد
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageData.stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-xl p-5 flex items-center justify-between shadow-sm"
          >
            <div className="flex flex-col gap-3 text-right">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon icon={stat.icon} className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-[13px] font-medium text-text-secondary">{stat.label}</p>
            </div>
            <p className="text-[26px] font-black text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main card (Table + search/filters) */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Search & filters bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative w-full sm:max-w-80">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Icon icon="lucide:search" className="w-4 h-4 text-text-muted" />
            </span>
            <input
              type="text"
              placeholder="البحث والتصفية..."
              className="w-full pl-3 pr-9 py-2 bg-white border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-[#FF5500]/50 text-right"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button className="flex items-center gap-1.5 bg-white border border-border px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:bg-surface transition-all">
              <Icon icon="lucide:filter" className="w-3.5 h-3.5" />
              تصفية
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-border px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:bg-surface transition-all">
              <Icon icon="lucide:arrow-up-down" className="w-3.5 h-3.5" />
              ترتيب
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-xs font-semibold text-text-secondary">
                {pageData.columns.map((col, idx) => (
                  <th key={idx} className="py-3.5 px-6 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="py-3.5 px-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-text-primary">
              {pageData.rows.map((row, rowIdx) => {
                const values = Object.keys(row).filter(k => k.startsWith("col"));
                return (
                  <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                    {values.map((colKey, colIdx) => {
                      const val = row[colKey];
                      const isStatus = colKey === "col4" && (slug === "reviews" || slug === "enrollments" || slug === "tasks" || slug === "evaluations") ||
                                       colKey === "col5" && (slug === "organizations" || slug === "beneficiaries" || slug === "programs" || slug === "subscriptions" || slug === "payments" || slug === "staff" || slug === "activity" || slug === "settings");
                      
                      if (isStatus) {
                        return (
                          <td key={colIdx} className="py-4 px-6">
                            <span
                              className="inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[10px]"
                              style={{
                                color: row.statusColor,
                                backgroundColor: row.statusColor + "10",
                                border: `1px solid ${row.statusColor}20`
                              }}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={colIdx} className="py-4 px-6 font-medium">
                          {val}
                        </td>
                      );
                    })}
                    <td className="py-4 px-6 text-left">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-primary transition-all">
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-primary transition-all">
                          <Icon icon="lucide:edit" className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg text-text-secondary hover:text-red-500 transition-all">
                          <Icon icon="lucide:trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted bg-gray-50/50">
          <span>عرض 1-3 من أصل 3 سجلات</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-border bg-white rounded-lg hover:bg-surface disabled:opacity-50" disabled>
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 border border-[#FF5500] bg-[#FF5500] text-white rounded-lg font-medium">
              1
            </button>
            <button className="p-1.5 border border-border bg-white rounded-lg hover:bg-surface disabled:opacity-50" disabled>
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

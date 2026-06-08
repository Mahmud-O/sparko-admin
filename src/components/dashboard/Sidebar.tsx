"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSidebarStore } from "@/store/useSidebarStore";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

/* ─── Admin sidebar items ────────────────────────────────────────────────── */
const adminSidebarItems: SidebarItem[] = [
  { name: "الرئيسية", href: "/dashboard", icon: "lucide:home" },
  { name: "المراجعات", href: "/dashboard/reviews", icon: "lucide:clipboard-check" },
  { name: "الجهات", href: "/dashboard/organizations", icon: "lucide:building-2" },
  { name: "المستفيدين", href: "/dashboard/beneficiaries", icon: "lucide:users" },
  { name: "البرامج", href: "/dashboard/programs", icon: "lucide:layout-grid" },
  { name: "الانضمامات", href: "/dashboard/enrollments", icon: "lucide:user-plus" },
  { name: "المهام", href: "/dashboard/tasks", icon: "lucide:check-square" },
  { name: "التقييمات والتقارير", href: "/dashboard/evaluations", icon: "lucide:bar-chart-3" },
  { name: "الاشتراكات والخدمات", href: "/dashboard/subscriptions", icon: "lucide:credit-card" },
  { name: "المدفوعات", href: "/dashboard/payments", icon: "lucide:wallet" },
  { name: "الدعم والتذاكر", href: "/dashboard/support", icon: "lucide:headset" },
  { name: "الموظفون والصلاحيات", href: "/dashboard/staff", icon: "lucide:shield" },
  { name: "سجل النشاطات", href: "/dashboard/activity", icon: "lucide:history" },
  { name: "الإعدادات", href: "/dashboard/settings", icon: "lucide:settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { isOpen, toggle } = useSidebarStore();

  const sidebarItems = adminSidebarItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggle}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`bg-white rounded-2xl h-full flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out z-50
          fixed md:relative top-2 bottom-2 right-2 md:right-auto md:top-0 md:bottom-0 
          ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
        style={{ width: isOpen ? 220 : 72 }}
      >
      {/* Logo + Toggle */}
      <div className="h-18 flex items-center justify-between px-3 border-b border-border shrink-0">
        
        {/* Logo (visible only when open) */}
        {isOpen && (
          <Link href="/dashboard" className="flex items-center gap-2 mr-2">
            <Image
              src="/sparko.png"
              alt="Sparko"
              width={100}
              height={32}
              style={{ width: "auto", height: "auto" }}
              className="object-contain"
              priority
            />
          </Link>
        )}

        {/* Toggle button */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#1E293B] transition-all shrink-0"
          aria-label="toggle sidebar"
        >
          <Icon icon={isOpen ? "lucide:circle-arrow-right" : "lucide:menu"} className="w-6 h-6 text-primary" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isOpen ? "px-4 py-2.5" : "px-0 py-2.5 justify-center"
              } ${
                isActive
                  ? "bg-[#FFF0E8] text-[#FF5500] font-bold"
                  : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#1E293B]"
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <Icon
                icon={item.icon}
                className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-[#FF5500]" : "text-[#94A3B8]"}`}
              />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4">
        <button
          onClick={logout}
          className={`flex items-center gap-3 rounded-lg text-[13px] font-medium text-[#FF5500] hover:bg-red-50 transition-all duration-200 w-full ${
            isOpen ? "px-4 py-2.5" : "px-0 py-2.5 justify-center"
          }`}
          title={!isOpen ? "تسجيل الخروج" : undefined}
        >
          <Icon icon="lucide:log-out" className="w-[18px] h-[18px] shrink-0" />
          {isOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  </>
  );
}

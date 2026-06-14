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
  { name: "الرئيسية", href: "/dashboard", icon: "ri:home-5-line" },
  { name: "الطلبات والمراجعات", href: "/dashboard/reviews", icon: "ri:file-list-3-line" },
  { name: "الجهات", href: "/dashboard/organizations", icon: "mingcute:building-2-line" },
  { name: "المستفيدين", href: "/dashboard/beneficiaries", icon: "lucide:user" },
  { name: "البرامج", href: "/dashboard/programs", icon: "lucide:book-open" },
  { name: "الانضمامات", href: "/dashboard/enrollments", icon: "charm:clipboard" },
  { name: "المهام", href: "/dashboard/tasks", icon: "material-symbols:check-box-outline-rounded" },
  { name: "التقييمات", href: "/dashboard/evaluations", icon: "ri:bar-chart-2-line" },
  { name: "المخرجات المهنية", href: "/dashboard/subscriptions", icon: "ri:vip-crown-line" },
  { name: "إدارة مجتمع Sparko", href: "/dashboard/community", icon: "/icons/sparko-set.svg" },
  { name: "المدفوعات", href: "/dashboard/payments", icon: "ri:money-dollar-circle-line" },
  { name: "الإدارة و الصلاحيات", href: "/dashboard/settings", icon: "ri:shield-user-line" },
  { name: "سجل الإدارة", href: "/dashboard/activity", icon: "lucide:history" },
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
          <Icon icon={isOpen ? "lucide:circle-chevron-left" : "lucide:menu"} className="w-6 h-6 text-primary" />
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
                isOpen 
                  ? "pl-4 pr-4 py-2.5 border-r-2" 
                  : "px-0 py-2.5 justify-center border-r-0"
              } ${
                isActive
                  ? "bg-[#FFF0E8] text-[#FF5500] font-bold border-[#FF5500]"
                  : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#1E293B] border-transparent"
              }`}
              title={!isOpen ? item.name : undefined}
            >
              {item.name === "إدارة مجتمع Sparko" ? (
                <Image
                  src={item.icon}
                  alt="Sparko-set"
                  width={20}
                  height={20}
                  style={{ width: "auto", height: "auto" ,color:"#64748B"}}
                  className="object-contain"
                  priority
                />
              ) : (
                <Icon
                  icon={item.icon}
                  className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-[#FF5500]" : "text-[#64748B]"}`}
                />
              )}
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
          <Image
            src="/icons/تسجيل الدخول.svg"
            alt="تسجيل الخروج"
            width={18}
            height={18}
            className="shrink-0 object-contain "
          />
          {isOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  </>
  );
}

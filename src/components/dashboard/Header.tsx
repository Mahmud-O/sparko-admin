"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import NotificationsModal from "@/components/dashboard/NotificationsModal";

export default function Header() {
  const { user } = useAuthStore();
  const { toggle } = useSidebarStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="bg-white rounded-2xl flex items-center justify-between px-4 py-3 md:px-6 md:py-4 shrink-0 gap-3">
        {/* Right side: Hamburger + Notification + Search */}
        <div className="flex items-center gap-2 md:gap-3 flex-1">
          {/* Hamburger button (visible on mobile only) */}
          <button
            onClick={toggle}
            className="md:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#1E293B] transition-all shrink-0 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Icon icon="lucide:menu" className="w-5 h-5 text-primary" />
          </button>

          {/* Notification */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative outline outline-offset-1 outline-zinc-200 p-2 rounded-lg text-[#64748B] hover:bg-[#F8F9FA] transition-all shrink-0 cursor-pointer"
          >
            <Icon icon="lucide:bell" className="w-5 h-5" />
            <span className="absolute flex justify-center items-center text-[6px] text-white top-1.5 right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white">30</span>
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F8F9FA] px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-border w-28 xs:w-36 sm:w-48 md:w-80 lg:w-125 transition-all">
            <input
              type="text"
              placeholder="البحث"
              className="bg-transparent border-none outline-none text-[13px] text-[#1E293B] placeholder-[#94A3B8] w-full text-right leading-relaxed"
            />
            <Icon icon="lucide:search" className="text-[#94A3B8] w-4 h-4 shrink-0" />
          </div>
        </div>

        {/* Left side: Language + Company Info */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer transition-colors">
            <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#64748B]" />
            <div className="text-right flex-col hidden sm:flex">
              <span className="font-bold text-[12px] leading-tight">العربية</span>
              <span className="text-[#94A3B8] text-[9px] leading-tight">تغيير اللغة</span>
            </div>
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#F1F5F9] flex items-center justify-center">
              <img
                src="/saudi-arabia-48.svg"
                alt="SA"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<span class="text-[#64748B] text-[10px] font-bold">SA</span>`;
                }}
              />
            </div>
          </div>

          <div className="w-px h-6 bg-border"></div>

          {/* Company Badge */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-[14px] font-bold text-[#1E293B] bg-[#F8F9FA] px-2 py-1 rounded max-w-fit flex items-center justify-center">
              STC
            </div>
            <span className="text-[12px] font-bold text-[#1E293B] hidden md:inline">شركة الاتصالات السعودية - STC</span>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}

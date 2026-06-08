"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/components/ui/Modal";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface Notification {
  id: number;
  title: string;
  time: string;
  category: string;
  categoryKey: string;
  icon: string;
  isUnread: boolean;
}

/* ─── Static Data ───────────────────────────────────────────────────────────── */

const notifications: Notification[] = [
  {
    id: 1,
    title: "وصول طلب تدريب جديد من ماجد بقشان",
    time: "منذ 9 دقائق",
    category: "طلبات المستفيدين",
    categoryKey: "requests",
    icon: "lucide:users",
    isUnread: true,
  },
  {
    id: 2,
    title: "تقييم مهام اليوم لماجد بقشان",
    time: "منذ ساعة",
    category: "تقييمات المستفيدين",
    categoryKey: "evaluations",
    icon: "lucide:bell",
    isUnread: true,
  },
  {
    id: 3,
    title: "اقتراب انتهاء فترة تدريب نورة الحربي",
    time: "منذ 3 ساعات",
    category: "مهام المستفيدين",
    categoryKey: "evaluations",
    icon: "lucide:bell",
    isUnread: false,
  },
  {
    id: 4,
    title: "لديك مستفيد بحاجة لمراجعة المهام",
    time: "منذ 3 ساعات",
    category: "مهام المستفيدين",
    categoryKey: "evaluations",
    icon: "lucide:bell",
    isUnread: false,
  },
  {
    id: 5,
    title: "تم قبول فيصل العتيبي في برنامج الامتياز",
    time: "أمس",
    category: "طلبات المستفيدين",
    categoryKey: "requests",
    icon: "lucide:users",
    isUnread: false,
  },
  {
    id: 6,
    title: "فاتورة جديدة: حملة ترويج البرامج المهنية",
    time: "قبل يومين",
    category: "النظام والفوترة",
    categoryKey: "system",
    icon: "lucide:monitor",
    isUnread: false,
  },
  {
    id: 7,
    title: "هل تم تقييم مهام المستفيد اليوم؟",
    time: "قبل 3 أيام",
    category: "النظام والفوترة",
    categoryKey: "system",
    icon: "lucide:alert-triangle",
    isUnread: false,
  },
  {
    id: 8,
    title: "تم إصدار تقرير التدريب النهائي بنجاح",
    time: "قبل 3 أيام",
    category: "التقارير",
    categoryKey: "system",
    icon: "lucide:file-clock",
    isUnread: false,
  },
];

const filterTabs = [
  { key: "all", label: "الكل" },
  { key: "requests", label: "طلبات المستفيدين" },
  { key: "evaluations", label: "تقييم المستفيدين" },
  { key: "system", label: "النظام والفوترة" },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.categoryKey === activeFilter);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="custom" className="w-[580px] max-h-[85vh]">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            {/* Close + Unread badge */}
              <h2 className="text-[18px] font-bold text-[#1E293B]">الإشعارات</h2>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-[#FF5500] text-white text-[12px] font-bold px-3 py-1 rounded-full">
                  {unreadCount} غير مقروء
                </span>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center text-primary  hover:bg-[#E2E8F0] transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>
            {/* Title */}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all ${
                  activeFilter === tab.key
                    ? "bg-[#FF5500] text-white border-[#FF5500]"
                    : "bg-white text-[#64748B] border-border hover:border-[#94A3B8]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notifications List ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
          {filtered.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                notification.isUnread
                  ? "bg-[#FFF5EE] border-[#FFE0CC]"
                  : "bg-white border-border"
              }`}
            >
              {/* Icon (LEFT side visually = end in RTL) */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  notification.isUnread
                    ? "bg-[#FF5500] text-white"
                    : "bg-[#F8F9FA] text-[#94A3B8]"
                }`}
              >
                <Icon icon={notification.icon} className="w-5 h-5" />
              </div>

              {/* Content (RIGHT side visually = start in RTL) */}
              <div className="flex-1 text-right min-w-0">
                <p className={`text-[13px] leading-snug ${
                  notification.isUnread
                    ? "font-bold text-[#1E293B]"
                    : "font-medium text-[#1E293B]"
                }`}>
                  {notification.title}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  {notification.time} · {notification.category}
                </p>
              </div>

              {/* Unread dot indicator (far RIGHT in RTL) */}
              {notification.isUnread && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shrink-0"></span>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#94A3B8] text-[13px]">
              لا توجد إشعارات
            </div>
          )}
        </div>
    </Modal>
  );
}

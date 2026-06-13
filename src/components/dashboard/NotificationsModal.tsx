"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/components/ui/Modal";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface Notification {
  id: number;
  title: string;
  time: string;
  category: string;
  icon: string;
  isUnread: boolean;
}

/* ─── Exported Mock Data ────────────────────────────────────────────────────── */

export const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "جهة جديدة بانتظار المراجعة",
    time: "منذ ٠٩ دقائق",
    category: "طلبات المستفيدين",
    icon: "lucide:user",
    isUnread: true,
  },
  {
    id: 2,
    title: "مستفيد لم يكمل المستندات",
    time: "منذ ساعة",
    category: "تقييمات المستفيدين",
    icon: "lucide:bell",
    isUnread: true,
  },
  {
    id: 3,
    title: "تقييم جاهز للاعتماد",
    time: "منذ ٣ ساعات",
    category: "مهام المستفيدين",
    icon: "lucide:bell",
    isUnread: false,
  },
  {
    id: 4,
    title: "انضمام بانتظار الدفع",
    time: "منذ ٣ ساعات",
    category: "مهام المستفيدين",
    icon: "lucide:bell",
    isUnread: false,
  },
  {
    id: 5,
    title: "تم قبول فيصل العتيبي في برنامج الامتياز",
    time: "أمس",
    category: "طلبات المستفيدين",
    icon: "lucide:user",
    isUnread: false,
  },
  {
    id: 6,
    title: "فاتورة جديدة : دفع اشتراك مستفيد",
    time: "قبل يومين",
    category: "النظام والفوترة",
    icon: "lucide:credit-card",
    isUnread: false,
  },
  {
    id: 7,
    title: "هل تم تقييم مهام المستفيد اليوم؟",
    time: "قبل ٣ أيام",
    category: "مهام المستفيدين",
    icon: "lucide:alert-triangle",
    isUnread: false,
  },
  {
    id: 8,
    title: "تم اصدار تقرير مستفيد",
    time: "قبل ٣ أيام",
    category: "التقارير",
    icon: "lucide:clipboard-list",
    isUnread: false,
  },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead
}: NotificationsModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.isUnread);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="custom" className="w-140 h-[85vh] p-6 rounded-3xl">
      {/* ── Header ── */}
      <div className="shrink-0 space-y-5 mb-5">
        
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-black text-text-primary">الإشعارات</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5F5F5] text-[#888888] flex items-center justify-center hover:bg-[#EAEAEA] transition-all cursor-pointer"
            title="إغلاق"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs and Actions row */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            
            {/* Tab: الكل */}
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeTab === "all"
                  ? "bg-[#FFF0E8] border-[#FFD5C2] text-[#FF5500]"
                  : "bg-surface border-transparent text-text-secondary hover:border-border"
              }`}
            >
              <span>الكل</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                activeTab === "all"
                  ? "bg-white text-[#FF5500] border border-[#FF5500]/10"
                  : "bg-[#E2E8F0] text-text-secondary"
              }`}>
                {totalCount}
              </span>
            </button>

            {/* Tab: غير مقروءة */}
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeTab === "unread"
                  ? "bg-[#F1F5F9] border-[#CBD5E1] text-[#475569]"
                  : "bg-surface border-transparent text-text-secondary hover:border-border"
              }`}
            >
              <span>غير مقروءة</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                activeTab === "unread"
                  ? "bg-white text-[#475569] border border-[#CBD5E1]/20"
                  : "bg-[#E2E8F0] text-text-secondary"
              }`}>
                {unreadCount}
              </span>
            </button>

          </div>

          {/* Mark all as read */}
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-bold text-[#FF5500] hover:text-[#E04E00] transition-colors cursor-pointer"
          >
            تعيين الكل كمقروء
          </button>
        </div>

      </div>

      {/* ── Notifications List ── */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pl-3 pr-1">
        {filtered.map((notification) => (
          <div
            key={notification.id}
            onClick={() => onMarkAsRead(notification.id)}
            className={`flex items-center gap-4.5 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${
              notification.isUnread
                ? "bg-[#FFF5EE] border-[#FFE0CC]"
                : "bg-white border-border hover:bg-surface/50"
            }`}
          >
            {/* Far Right: Icon Container */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                notification.isUnread
                  ? "bg-[#FF5500] text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              <Icon icon={notification.icon} className="w-5 h-5" />
            </div>

            {/* Middle: Content */}
            <div className="flex-1 text-right min-w-0">
              <p className={`text-xs leading-snug text-text-primary ${
                notification.isUnread ? "font-bold" : "font-medium"
              }`}>
                {notification.title}
              </p>
              <p className="text-[10px] text-text-muted mt-1.5">
                {notification.time} • {notification.category}
              </p>
            </div>

            {/* Far Left: Unread Indicator Dot */}
            {notification.isUnread && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shrink-0"></span>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted text-xs">
            لا توجد إشعارات مطابقة
          </div>
        )}
      </div>
    </Modal>
  );
}

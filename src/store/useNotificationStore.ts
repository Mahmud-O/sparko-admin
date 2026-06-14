import { create } from "zustand";
import { apiFetchJson } from "@/lib/api";

export interface Notification {
  id: string;
  title: string;
  time: string;
  category: string;
  categoryKey: string;
  icon: string;
  isUnread: boolean;
  type: string;
}

interface NotificationStore {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

function getFriendlyTime(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return "أمس";
    if (diffDays === 2) return "قبل يومين";
    return `قبل ${diffDays} أيام`;
  } catch {
    return "منذ فترة";
  }
}

const mapApiNotification = (apiNotif: any): Notification => {
  const type = apiNotif.type || apiNotif.notificationType || "USER_APPLICATIONS";
  
  let category = "طلبات المستفيدين";
  let categoryKey = "requests";
  let icon = "lucide:user";

  switch (type) {
    case "USER_APPLICATIONS":
      category = "طلبات المستفيدين";
      categoryKey = "requests";
      icon = "lucide:user";
      break;
    case "USER_EVALUATIONS":
      category = "تقييمات المستفيدين";
      categoryKey = "evaluations";
      icon = "lucide:bell";
      break;
    case "USER_TASKS":
      category = "مهام المستفيدين";
      categoryKey = "evaluations";
      icon = "lucide:bell";
      break;
    case "REPORTS":
      category = "التقارير";
      categoryKey = "system";
      icon = "lucide:clipboard-list";
      break;
    case "SYSTEM_AND_BILLING":
      category = "النظام والفوترة";
      categoryKey = "system";
      icon = "lucide:credit-card";
      break;
  }

  const friendlyTime = getFriendlyTime(apiNotif.createdAt || apiNotif.time || new Date().toISOString());

  return {
    id: String(apiNotif.id),
    title: apiNotif.title || apiNotif.message || "إشعار جديد",
    time: friendlyTime,
    category,
    categoryKey,
    icon,
    isUnread: apiNotif.isUnread !== undefined ? apiNotif.isUnread : (apiNotif.isRead !== undefined ? !apiNotif.isRead : true),
    type
  };
};

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await apiFetchJson<any[]>("/api/notifications");
      const mapped = (data || []).map(mapApiNotification);
      const unread = mapped.filter((n) => n.isUnread).length;
      set({ notifications: mapped, unreadCount: unread });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    const prevNotifications = get().notifications;
    const updated = prevNotifications.map((n) =>
      n.id === id ? { ...n, isUnread: false } : n
    );
    const unread = updated.filter((n) => n.isUnread).length;
    set({ notifications: updated, unreadCount: unread });

    try {
      await apiFetchJson(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
      // Revert on failure
      const revertedUnread = prevNotifications.filter((n) => n.isUnread).length;
      set({ notifications: prevNotifications, unreadCount: revertedUnread });
    }
  },

  markAllAsRead: async () => {
    const prevNotifications = get().notifications;
    const updated = prevNotifications.map((n) => ({ ...n, isUnread: false }));
    set({ notifications: updated, unreadCount: 0 });

    try {
      await apiFetchJson("/api/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      // Revert on failure
      const revertedUnread = prevNotifications.filter((n) => n.isUnread).length;
      set({ notifications: prevNotifications, unreadCount: revertedUnread });
    }
  }
}));

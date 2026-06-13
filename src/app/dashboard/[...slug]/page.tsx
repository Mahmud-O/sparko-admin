"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageData {
  title: string;
  description: string;
  stats: { label: string; value: string | number; icon: string; color: string; bg: string }[];
  columns: string[];
  rows: Record<string, any>[];
}

const pageDataMap: Record<string, PageData> = {
  organizations: {
    title: "إدارة الجهات",
    description: "إدارة وتتبع الجهات المسجلة والشركاء في المنظومة",
    stats: [
      { label: "جهات نشطة", value: 24, icon: "lucide:building-2", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "فروع رئيسية", value: 5, icon: "lucide:git-branch", color: "#8B5CF6", bg: "#F5F3FF" },
      { label: "مشرفين مسجلين", value: 34, icon: "lucide:shield-user", color: "#F59E0B", bg: "#FFFBEB" },
    ],
    columns: ["اسم الجهة", "القطاع", "الفروع", "المستفيدين", "الحالة"],
    rows: [
      { col1: "شركة الاتصالات السعودية STC", col2: "خاص", col3: "5 فروع", col4: "120 مستفيد", col5: "نشط", statusColor: "#22C55E" },
      { col1: "أرامكو السعودية", col2: "شبه حكومي", col3: "8 فروع", col4: "150 مستفيد", col5: "نشط", statusColor: "#22C55E" },
      { col1: "بنك الرياض", col2: "خاص", col3: "3 فروع", col4: "45 مستفيد", col5: "نشط", statusColor: "#22C55E" },
      { col1: "سابك", col2: "شبه حكومي", col3: "4 فروع", col4: "70 مستفيد", col5: "غير نشط", statusColor: "#EF4444" },
    ],
  },
  beneficiaries: {
    title: "إدارة المستفيدين",
    description: "تتبع ملفات وبيانات المستفيدين من البرامج والتدريب",
    stats: [
      { label: "مستفيد نشط", value: 147, icon: "lucide:users", color: "#8B5CF6", bg: "#F5F3FF" },
      { label: "تحت التوثيق", value: 28, icon: "lucide:user-check", color: "#FF5500", bg: "#fff1eb" },
      { label: "نسبة الجاهزية", value: "95%", icon: "lucide:trending-up", color: "#22C55E", bg: "#F0FDF4" },
    ],
    columns: ["الاسم", "الجهة", "البرنامج", "تاريخ الانضمام", "الحالة"],
    rows: [
      { col1: "سارة خالد الخليفي", col2: "أرامكو", col3: "تطوير المهارات الإدارية", col4: "2026/05/06", col5: "نشط", statusColor: "#22C55E" },
      { col1: "فيد عبد السبيعي", col2: "STC", col3: "التدريب التعاوني لتقنية المعلومات", col4: "2026/05/06", col5: "تحت التوثيق", statusColor: "#FF5500" },
      { col1: "ليلى محمد الزهراني", col2: "أرامكو", col3: "تحليل البيانات ، Python", col4: "2026/05/05", col5: "نشط", statusColor: "#22C55E" },
      { col1: "عبدالله سعد المريخي", col2: "بنك الرياض", col3: "خدمة العملاء الإحترافية", col4: "2026/05/04", col5: "نشط", statusColor: "#22C55E" },
    ],
  },
  programs: {
    title: "إدارة البرامج",
    description: "عرض وتحديث البرامج التدريبية المعتمدة",
    stats: [
      { label: "برامج نشطة", value: 12, icon: "lucide:book-open", color: "#22C55E", bg: "#F0FDF4" },
      { label: "بانتظار النشر", value: 7, icon: "lucide:clock", color: "#FF5500", bg: "#fff1eb" },
      { label: "متوسط الإكمال", value: "85%", icon: "lucide:award", color: "#8B5CF6", bg: "#F5F3FF" },
    ],
    columns: ["اسم البرنامج", "الجهة", "المستفيدين", "نسبة الإكمال", "الحالة"],
    rows: [
      { col1: "برنامج تطوير المهارات الإدارية", col2: "أرامكو", col3: "8 مستفيدين", col4: "91%", col5: "نشط", statusColor: "#22C55E" },
      { col1: "برنامج التدريب التعاوني تقنية", col2: "STC", col3: "12 مستفيداً", col4: "82%", col5: "نشط", statusColor: "#22C55E" },
      { col1: "برنامج التدريب على خدمة العملاء", col2: "بنك الرياض", col3: "5 مستفيدين", col4: "65%", col5: "نشط", statusColor: "#22C55E" },
      { col1: "برنامج القيادة الإدارية المتقدمة", col2: "STC", col3: "15 مستفيداً", col4: "45%", col5: "مسودة", statusColor: "#94A3B8" },
    ],
  },
  enrollments: {
    title: "إدارة الانضمامات",
    description: "مراجعة واعتماد طلبات انضمام المستفيدين للبرامج",
    stats: [
      { label: "طلب جديد", value: 23, icon: "lucide:user-plus", color: "#FF5500", bg: "#fff1eb" },
      { label: "طلبات مقبولة", value: 150, icon: "lucide:smile", color: "#22C55E", bg: "#F0FDF4" },
      { label: "طلبات مرفوضة", value: 4, icon: "lucide:frown", color: "#EF4444", bg: "#FEF2F2" },
    ],
    columns: ["الاسم", "البرنامج", "الجهة", "تاريخ الطلب", "الحالة"],
    rows: [
      { col1: "أحمد بن عبدالله", col2: "القيادة الإدارية المتقدمة", col3: "STC", col4: "2026/06/07", col5: "جديد", statusColor: "#FF5500" },
      { col1: "منى محمد الحربي", col2: "تحليل البيانات ، Python", col3: "أرامكو", col4: "2026/06/06", col5: "مقبول", statusColor: "#22C55E" },
      { col1: "خالد سعيد القحطاني", col2: "خدمة العملاء الإحترافية", col3: "بنك الرياض", col4: "2026/06/05", col5: "جديد", statusColor: "#FF5500" },
    ],
  },
  tasks: {
    title: "إدارة المهام",
    description: "متابعة حالة المهام المعطاة للمستفيدين والبرامج التدريبية",
    stats: [
      { label: "مهمة نشطة", value: 450, icon: "lucide:check-square", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "نسبة الإكمال", value: "88%", icon: "lucide:check-circle", color: "#22C55E", bg: "#F0FDF4" },
      { label: "مهام معلقة", value: 12, icon: "lucide:alert-circle", color: "#FF5500", bg: "#fff1eb" },
    ],
    columns: ["المهمة", "البرنامج", "المستفيد", "الأولوية", "الحالة"],
    rows: [
      { col1: "إعداد التقرير المالي الأول", col2: "تطوير المهارات الإدارية", col3: "سارة خالد", col4: "عالية", col5: "مكتملة", statusColor: "#22C55E" },
      { col1: "تصميم واجهة المستخدم التجريبية", col2: "التدريب التعاوني تقنية", col3: "فيد عبد السبيعي", col4: "متوسطة", col5: "قيد التنفيذ", statusColor: "#FF5500" },
      { col1: "اختبار كود التحقق من البيانات", col2: "تحليل البيانات ، Python", col3: "ليلى محمد", col4: "منخفضة", col5: "معلقة", statusColor: "#94A3B8" },
    ],
  },
  evaluations: {
    title: "التقييمات والتقارير",
    description: "إدارة تقييمات الأداء وإصدار التقارير للمستفيدين والبرامج",
    stats: [
      { label: "متوسط التقييم العام", value: "4.6 / 5", icon: "lucide:star", color: "#F59E0B", bg: "#FFFBEB" },
      { label: "نسبة التفاعل والتقييم", value: "92%", icon: "lucide:trending-up", color: "#22C55E", bg: "#F0FDF4" },
      { label: "تقارير معلقة", value: 18, icon: "lucide:file-text", color: "#FF5500", bg: "#fff1eb" },
    ],
    columns: ["اسم المستفيد", "البرنامج", "التقييم الذاتي", "تقييم المشرف", "الحالة"],
    rows: [
      { col1: "سارة خالد الخليفي", col2: "تطوير المهارات الإدارية", col3: "4.8", col4: "4.6", col5: "معتمد", statusColor: "#22C55E" },
      { col1: "فيد عبد السبيعي", col2: "التدريب التعاوني تقنية", col3: "4.5", col4: "4.3", col5: "بانتظار الاعتماد", statusColor: "#FF5500" },
      { col1: "ليلى محمد الزهراني", col2: "تحليل البيانات ، Python", col3: "4.2", col4: "4.0", col5: "معتمد", statusColor: "#22C55E" },
    ],
  },
  subscriptions: {
    title: "الاشتراكات والخدمات",
    description: "إدارة باقات اشتراكات الجهات والخدمات المتاحة",
    stats: [
      { label: "اشتراكات نشطة", value: 18, icon: "lucide:credit-card", color: "#22C55E", bg: "#F0FDF4" },
      { label: "باقات تجريبية", value: 6, icon: "lucide:gift", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "تجديدات قادمة", value: 3, icon: "lucide:alert-circle", color: "#FF5500", bg: "#fff1eb" },
    ],
    columns: ["الجهة", "الباقة", "تاريخ البدء", "تاريخ الانتهاء", "الحالة"],
    rows: [
      { col1: "شركة الاتصالات السعودية STC", col2: "Enterprise Premium", col3: "2026/01/01", col4: "2027/01/01", col5: "نشط", statusColor: "#22C55E" },
      { col1: "أرامكو السعودية", col2: "Enterprise Custom", col3: "2026/03/15", col4: "2027/03/15", col5: "نشط", statusColor: "#22C55E" },
      { col1: "بنك الرياض", col2: "Standard Plan", col3: "2026/05/01", col4: "2027/05/01", col5: "نشط", statusColor: "#22C55E" },
    ],
  },
  payments: {
    title: "إدارة المدفوعات",
    description: "تتبع الفواتير والعمليات المالية والتحصيلات في النظام",
    stats: [
      { label: "المدفوعات المستلمة", value: "120k SAR", icon: "lucide:wallet", color: "#22C55E", bg: "#F0FDF4" },
      { label: "مدفوعات معلقة", value: "15k SAR", icon: "lucide:clock", color: "#FF5500", bg: "#fff1eb" },
      { label: "عمليات مستردة", value: 3, icon: "lucide:refresh-cw", color: "#EF4444", bg: "#FEF2F2" },
    ],
    columns: ["رقم الفاتورة", "الجهة", "المبلغ", "طريقة الدفع", "الحالة"],
    rows: [
      { col1: "INV-2026-001", col2: "شركة الاتصالات السعودية STC", col3: "45,000 ر.س", col4: "حوالة بنكية", col5: "مدفوع", statusColor: "#22C55E" },
      { col1: "INV-2026-002", col2: "أرامكو السعودية", col3: "60,000 ر.س", col4: "بطاقة ائتمانية", col5: "مدفوع", statusColor: "#22C55E" },
      { col1: "INV-2026-003", col2: "بنك الرياض", col3: "15,000 ر.س", col4: "حوالة بنكية", col5: "قيد الانتظار", statusColor: "#FF5500" },
    ],
  },
  support: {
    title: "الدعم والتذاكر",
    description: "الرد على استفسارات وحل تذاكر الدعم الفني للمستخدمين والجهات",
    stats: [
      { label: "تذاكر مفتوحة", value: 8, icon: "lucide:message-square", color: "#FF5500", bg: "#fff1eb" },
      { label: "تذاكر عاجلة", value: 3, icon: "lucide:alert-triangle", color: "#EF4444", bg: "#FEF2F2" },
      { label: "متوسط وقت الاستجابة", value: "45 دقيقة", icon: "lucide:timer", color: "#3B82F6", bg: "#EFF6FF" },
    ],
    columns: ["رقم التذكرة", "مرسل التذكرة", "الموضوع", "الأولوية", "الحالة"],
    rows: [
      { col1: "TK-982", col2: "فيد عبد السبيعي (STC)", col3: "مشكلة في تحميل شهادة الإكمال", col4: "عالية", col5: "مفتوحة", statusColor: "#FF5500" },
      { col1: "TK-981", col2: "أحمد الحربي (أرامكو)", col3: "تحديث الصلاحيات للمشرف الجديد", col4: "متوسطة", col5: "تحت المعالجة", statusColor: "#3B82F6" },
      { col1: "TK-980", col2: "سارة خالد (أرامكو)", col3: "استفسار بخصوص تسليم المهمة الثالثة", col4: "منخفضة", col5: "مغلقة", statusColor: "#22C55E" },
    ],
  },
  staff: {
    title: "الموظفون والصلاحيات",
    description: "إدارة حسابات وصلاحيات موظفي ومشرفي النظام",
    stats: [
      { label: "موظف نشط", value: 34, icon: "lucide:users", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "مجموعات الصلاحيات", value: 3, icon: "lucide:key", color: "#8B5CF6", bg: "#F5F3FF" },
      { label: "مشرفون مباشرون", value: 12, icon: "lucide:shield", color: "#22C55E", bg: "#F0FDF4" },
    ],
    columns: ["الاسم", "البريد الإلكتروني", "الدور", "القسم", "الحالة"],
    rows: [
      { col1: "عبدالرحمن آل سعود", col2: "a.alsaud@sparko.co", col3: "Super Admin", col4: "الإدارة العامة", col5: "نشط", statusColor: "#22C55E" },
      { col1: "هند العمري", col2: "h.omari@sparko.co", col3: "Admin", col4: "العمليات والدعم", col5: "نشط", statusColor: "#22C55E" },
      { col1: "سلطان الحربي", col2: "s.harbi@sparko.co", col3: "Moderator", col4: "مراجعة الجهات", col5: "نشط", statusColor: "#22C55E" },
    ],
  },
  activity: {
    title: "سجل النشاطات",
    description: "عرض سجل العمليات والأنشطة الأمنية والتشغيلية في النظام",
    stats: [
      { label: "عملية اليوم", value: 1240, icon: "lucide:activity", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "تحذيرات أمنية", value: 0, icon: "lucide:shield-alert", color: "#22C55E", bg: "#F0FDF4" },
      { label: "وقت تشغيل النظام", value: "99.9%", icon: "lucide:globe", color: "#8B5CF6", bg: "#F5F3FF" },
    ],
    columns: ["الموظف", "نوع النشاط", "تفاصيل العملية", "الوقت", "الحالة"],
    rows: [
      { col1: "عبدالرحمن آل سعود", col2: "تسجيل دخول", col3: "تم تسجيل الدخول بنجاح من IP 192.168.1.1", col4: "منذ 5 دقائق", col5: "ناجحة", statusColor: "#22C55E" },
      { col1: "هند العمري", col2: "اعتماد جهة", col3: "تمت مراجعة واعتماد ملف شركة STC", col4: "منذ 15 دقيقة", col5: "ناجحة", statusColor: "#22C55E" },
      { col1: "سلطان الحربي", col2: "تعديل إعدادات", col3: "تم تغيير نمط التشغيل الافتراضي للجهات", col4: "منذ ساعة", col5: "ناجحة", statusColor: "#22C55E" },
    ],
  },
  community: {
    title: "إدارة مجتمع Sparko",
    description: "إدارة التفاعلات والمشاركات والأنشطة المجتمعية في المنظومة",
    stats: [
      { label: "أعضاء المجتمع", value: 184, icon: "lucide:users", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "منشورات اليوم", value: 12, icon: "lucide:message-square", color: "#22C55E", bg: "#F0FDF4" },
      { label: "فعاليات نشطة", value: 3, icon: "lucide:calendar", color: "#8B5CF6", bg: "#F5F3FF" },
    ],
    columns: ["العضو", "الجهة", "النشاط", "تاريخ الانضمام", "الحالة"],
    rows: [
      { col1: "أحمد بن عبدالله", col2: "STC", col3: "شارك في ورشة عمل", col4: "2026/06/07", col5: "نشط", statusColor: "#22C55E" },
      { col1: "منى محمد الحربي", col2: "أرامكو", col3: "نشر مقالاً جديداً", col4: "2026/06/06", col5: "نشط", statusColor: "#22C55E" },
      { col1: "خالد سعيد القحطاني", col2: "بنك الرياض", col3: "سجل في الفعالية القادمة", col4: "2026/06/05", col5: "نشط", statusColor: "#22C55E" },
    ],
  },
  settings: {
    title: "الإدارة و الصلاحيات",
    description: "تحديث وضبط الخيارات والإعدادات العامة لمنظومة Sparko",
    stats: [
      { label: "إعدادات مفعلة", value: 12, icon: "lucide:toggle-left", color: "#3B82F6", bg: "#EFF6FF" },
      { label: "لغات مدعومة", value: "العربية، الإنجليزية", icon: "lucide:languages", color: "#8B5CF6", bg: "#F5F3FF" },
      { label: "إصدار النظام", value: "v1.2.0", icon: "lucide:info", color: "#F59E0B", bg: "#FFFBEB" },
    ],
    columns: ["الإعداد", "الوصف", "الخيار الحالي", "تاريخ التعديل", "الحالة"],
    rows: [
      { col1: "التسجيل المفتوح للجهات", col2: "السماح للجهات بالتسجيل مباشرة من الصفحة الرئيسية", col3: "مفعل", col4: "2026/05/20", col5: "نشط", statusColor: "#22C55E" },
      { col1: "التوثيق الثنائي (2FA)", col2: "فرض التحقق بخطوتين لجميع حسابات المسؤولين", col3: "معطل", col4: "2026/05/18", col5: "تنبيه أمني", statusColor: "#FF5500" },
      { col1: "إرسال التنبيهات البريدية", col2: "إرسال تقارير إنجاز المهام الأسبوعية للمشرفين تلقائياً", col3: "مفعل", col4: "2026/05/01", col5: "نشط", statusColor: "#22C55E" },
    ],
  },
};

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
  const pageData = pageDataMap[slug];

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

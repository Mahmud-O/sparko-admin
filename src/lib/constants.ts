import type { SelectOption, TermSection, PageData } from './types';

export const ORG_TYPES: SelectOption[] = [
  { value: "حكومية", label: "حكومية" },
  { value: "شبه حكومية", label: "شبه حكومية" },
  { value: "خاصة", label: "خاصة" },
  { value: "غير ربحية", label: "غير ربحية" },
];

export const SECTORS: SelectOption[] = [
  { value: "التعليم", label: "التعليم" },
  { value: "الصحة", label: "الصحة" },
  { value: "التقنية", label: "التقنية" },
];

export const CITIES: SelectOption[] = [
  { value: "الرياض", label: "الرياض" },
  { value: "جدة", label: "جدة" },
  { value: "الدمام", label: "الدمام" },
];

export const TERMS_DATA: TermSection[] = [
  {
    title: "نطاق الاستخدام",
    content: [
      "تستخدم منظومة Sparko لتمكين جهتك من إدارة برامج التدريب وربطها بالمستفيدين ومتابعة تقدمهم ضمن بيئة رقمية منظمة.",
    ],
  },
  {
    title: "التزامات الجهة",
    content: [
      "إدخال بيانات صحيحة ومحدثة",
      "استخدام المنظومة لأغراض التدريب فقط",
      "توفير بيئة تدريب مناسبة للمستفيدين",
      "متابعة أداء المستفيدين وتحديث بياناتهم بشكل دوري",
    ],
  },
  {
    title: "إدارة الحساب",
    content: [
      "تتحمل الجهة مسؤولية الحفاظ على سرية بيانات الدخول",
      "يُمنع مشاركة الحساب مع أي طرف غير مصرح له",
      "تتحمل الجهة كامل المسؤولية عن أي استخدام يتم من خلال حسابها",
    ],
  },
  {
    title: "حماية البيانات والخصوصية",
    content: [
      "تلتزم الجهة بالحفاظ على سرية بيانات المستفيدين",
      "تستخدم البيانات فقط لأغراض التشغيل والتدريب داخل المنظومة",
      "تلتزم منظومة Sparko بتطبيق الإجراءات التقنية المناسبة لحماية البيانات",
    ],
  },
  {
    title: "الاستخدام المقبول",
    content: [
      "يُمنع استخدام المنظومة لأي أغراض غير مصرح بها",
      "يُمنع محاولة اختراق النظام أو إساءة استخدامه",
      "تلتزم الجهة بالأنظمة واللوائح المعمول بها",
    ],
  },
  {
    title: "الإشعارات والدعم",
    content: [
      "تلتزم الجهة بإبلاغ إدارة المنظومة بأي مشكلة أو خلل خلال وقت مناسب",
      "توفر المنظومة قنوات دعم لمعالجة الطلبات والاستفسارات",
    ],
  },
  {
    title: "الإيقاف أو التعليق",
    content: [
      "مخالفة الشروط",
      "إساءة استخدام النظام",
      "إدخال بيانات غير صحيحة بشكل متكرر",
    ],
  },
  {
    title: "التحديثات",
    content: [
      "تحتفظ منظومة Sparko بحق تحديث هذه الاتفاقية، ويُعد استمرارك في استخدام المنظومة موافقة ضمنية على أي تحديثات تطرأ عليها.",
    ],
  },
];

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: "الرجاء تعبئة جميع الحقول المطلوبة",
  PASSWORD_MISMATCH: "كلمتا المرور غير متطابقتين",
  TERMS_REQUIRED: "الرجاء الموافقة على اتفاقية الاستخدام",
  FILE_REQUIRED: "الرجاء رفع المستند المطلوب",
} as const;

// ─── Status & Type Mappings (Reviews) ─────────────────────────────────────────

export const STATUS_CONFIG: Record<string, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
  PendingReview: {
    label: "تحت المراجعة",
    textClass: "text-[#FF5500]",
    bgClass: "bg-[#FFF0E8]",
    borderClass: "border-[#FFD5C2]"
  },
  Pending: {
    label: "تحت المراجعة",
    textClass: "text-[#FF5500]",
    bgClass: "bg-[#FFF0E8]",
    borderClass: "border-[#FFD5C2]"
  },
  pending: {
    label: "تحت المراجعة",
    textClass: "text-[#FF5500]",
    bgClass: "bg-[#FFF0E8]",
    borderClass: "border-[#FFD5C2]"
  },
  PendingApproval: {
    label: "تحت الموافقة",
    textClass: "text-[#D97706]",
    bgClass: "bg-[#FFFBEB]",
    borderClass: "border-[#FEF08A]"
  },
  PendingPublish: {
    label: "تحت النشر",
    textClass: "text-[#B45309]",
    bgClass: "bg-[#FFF7ED]",
    borderClass: "border-[#FED7AA]"
  },
  Approved: {
    label: "تم القبول",
    textClass: "text-[#34DEA7]",
    bgClass: "bg-[#EFFDF8]",
    borderClass: "border-[#A7F3D0]"
  },
  Rejected: {
    label: "مرفوض",
    textClass: "text-[#EF4444]",
    bgClass: "bg-[#FEF2F2]",
    borderClass: "border-[#FECFCF]"
  }
};

export const TYPE_CONFIG: Record<string, string> = {
  Organization: "تسجيل جهة",
  User: "تسجيل مستفيد",
  Program: "نشر برنامج",
  Enrollment: "انضمام",
  EditOrg: "تعديل بيانات جهة",
  EditUser: "تعديل بيانات مستفيد"
};

// ─── Dashboard Stats & Table Data ───────────────────────────────────────────

export const PENDING_ACTIONS = [
  { label: "طلبات  جهات", value: 14, icon: "ri:building-2-line", color: "#DBD300", bg: "#FFFBEB" },
  { label: "مستفيدين تحت التوثيق", value: 28, icon: "lucide:user", color: "#8B5CF6", bg: "#F5F3FF" },
  { label: "برامج بانتظار النشر", value: 7, icon: "lucide:book-open", color: "#4BE2B1", bg: "#EFFCF8" },
  { label: "طلبات انضمام", value: 23, icon: "ri:clipboard-line", color: "#D97706", bg: "#FFF7ED" },
];

export const OVERVIEW_STATS = [
  { label: "جهات نشطة", value: 24, subLabel: "2+ هذا الشهر", icon: "ri:building-2-line", color: "#DBD300", bg: "#FFFBEB" },
  { label: "برامج نشطة", value: 12, subLabel: "2+ جديدة", icon: "lucide:book-open", color: "#34DEA7", bg: "#EFFCF8" },
  { label: "مستفيدين من التدريب", value: 147, subLabel: "+12 الأسبوع", icon: "lucide:users", color: "#8B5CF6", bg: "#F5F3FF" },
  { label: "تذاكر مفتوحة", value: 8, subLabel: "3 عاجلة", icon: "ri:ticket-line", color: "#FF5500", bg: "#fff1eb" },
];

export const TOP_PROGRAMS = [
  { code: "PR", name: "برنامج تطوير المهارات الإدارية", org: "أرامكو", beneficiaries: 8, completion: 91, rating: 4.6, engagement: "92%" },
  { code: "PR", name: "برنامج التدريب التعاوني تقنية", org: "STC", beneficiaries: 12, completion: 82, rating: 4.3, engagement: "95%" },
  { code: "PR", name: "برنامج التدريب على خدمة العملاء", org: "بنك الرياض", beneficiaries: 5, completion: 65, rating: 3.8, engagement: "70%" },
  { code: "PR", name: "برنامج التدريب على خدمة العملاء", org: "بنك الرياض", beneficiaries: 5, completion: 65, rating: 3.8, engagement: "70%" },
  { code: "PR", name: "برنامج القيادة الإدارية المتقدمة", org: "STC", beneficiaries: 15, completion: 45, rating: 4.1, engagement: "88%" },
  { code: "PR", name: "برنامج القيادة الإدارية المتقدمة", org: "STC", beneficiaries: 15, completion: 45, rating: 4.1, engagement: "88%" },
  { code: "PR", name: "برنامج القيادة الإدارية المتقدمة", org: "STC", beneficiaries: 15, completion: 45, rating: 4.1, engagement: "88%" },
];

export const RECENT_ENROLLMENTS = [
  { name: "سارة خالد الخليفي", program: "تطوير المهارات الإدارية", org: "أرامكو", date: "2026/05/06", status: "جديد", statusColor: "#DBD300", statusBg: "#fcfbeb", bgboredr: "#F6F3BD" },
  { name: "فيد عبد السبيعي", program: "التدريب التعاوني لتقنية المعلومات", org: "STC", date: "2026/05/06", status: "مرسل للجهة", statusColor: "#2E34FF", statusBg: "#EFF6FF", bgboredr: "#CFE4FE" },
  { name: "ليلى محمد الزهراني", program: "تحليل البيانات ، Python", org: "أرامكو", date: "2026/05/05", status: "بانتظار الدفع", statusColor: "#D97706", statusBg: "#FCF4EB", bgboredr: "#FDEAA2" },
  { name: "عبدالله سعد المريخي", program: "خدمة العملاء الإحترافية", org: "بنك الرياض", date: "2026/05/04", status: "مقبول", statusColor: "#3FE0AC", statusBg: "#EFFCF8", bgboredr: "#A7F3D0" },
];

export const TOP_ORGANIZATIONS = [
  { rank: 1, name: "شركة الإتصالات STC", logo: "STC", logoBg: "#e0fafa", logoColor: "#059669", rating: 4.4, completion: 91, programs: 10, beneficiaries: 120 },
  { rank: 2, name: "أرامكو السعودية", logo: "أرامكو", logoBg: "#DCFCE7", logoColor: "#16A34A", rating: 4.1, completion: 91, programs: 9, beneficiaries: 100 },
  { rank: 3, name: "سابك", logo: "سابك", logoBg: "#EFF6FF", logoColor: "#3B82F6", rating: 4.7, completion: 91, programs: 7, beneficiaries: 70 },
];

// ─── Catch-All Slug Data ─────────────────────────────────────────────────────

export const PAGE_DATA_MAP: Record<string, PageData> = {
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
      { col1: "سلطان الحربي", col2: "s.harbi@sparko.co", mycol3: "Moderator", col4: "مراجعة الجهات", col5: "نشط", statusColor: "#22C55E" },
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
      { col1: "التسجيل المفتوح للجهات", col2: "السماح للجهات بالتسجيل مباشرة من الصفحة الرئيسية", col3: "مفعل", col4: "2026/05/20", col5: "نشط", statusColor: "#22C55E" },
      { col1: "التوثيق الثنائي (2FA)", col2: "فرض التحقق بخطوتين لجميع حسابات المسؤولين", col3: "معطل", col4: "2026/05/18", col5: "تنبيه أمني", statusColor: "#FF5500" },
      { col1: "إرسال التنبيهات البريدية", col2: "إرسال تقارير إنجاز المهام الأسبوعية للمشرفين تلقائياً", col3: "مفعل", col4: "2026/05/01", col5: "نشط", statusColor: "#22C55E" },
    ],
  },
};

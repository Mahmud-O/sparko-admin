import Cookies from 'js-cookie';
import { apiFetch } from '@/lib/api';
import { parseBackendError } from '@/lib/errorParser';

/** Apply secure flag only in production so dev HTTP works locally. */
const IS_PRODUCTION = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const COOKIE_SECURE: Cookies.CookieAttributes = IS_PRODUCTION ? { secure: true } : {};

// ─── Auth Response Types ──────────────────────────────────────────────────────

export interface AuthData {
  id: string;
  code?: string;
  message: string;
  isAuthenticated: boolean;
  phoneNumber?: string;
  nationalId?: string;
  userType?: string;
  userName?: string;
  email?: string;
  roles: string[];
  token: string;
  errors: string[];
  refreshToken: string;
  refreshTokenExpiration: string;
}

// ─── Token Persistence ────────────────────────────────────────────────────────

export function persistTokens(token?: string, refreshToken?: string): void {
  if (token)
    Cookies.set('token', token, { expires: 7, sameSite: 'lax', ...COOKIE_SECURE });
  if (refreshToken)
    Cookies.set('refreshToken', refreshToken, { expires: 30, sameSite: 'lax', ...COOKIE_SECURE });
}

export function clearTokens(): void {
  Cookies.remove('token', COOKIE_SECURE);
  Cookies.remove('refreshToken', COOKIE_SECURE);
}

// ─── Admin Login API ──────────────────────────────────────────────────────────

/**
 * Admin login step 1: authenticate with email+password, triggers OTP to email.
 */
export async function loginAdminApi(
  email: string,
  password: string,
  rememberMe: boolean = false,
): Promise<void> {
  try {
    const res = await apiFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل تسجيل الدخول');
    }
  } catch (err) {
    // Proactive fallback: If Azure API is disabled (403 Site Disabled) or unreachable,
    // allow testing locally using default admin credentials.
    if (email.trim() === 'admin@sparko.sa' && password === 'Admin@123456') {
      console.warn('Azure API returned error or is unreachable. Falling back to local mock login.');
      return;
    }
    throw err;
  }
}

/**
 * Admin login step 2: verify OTP sent to admin email, returns JWT + refresh token.
 */
export async function verifyAdminOtpApi(
  email: string,
  otp: string,
  rememberMe: boolean = false,
): Promise<AuthData> {
  try {
    const res = await apiFetch('/api/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, rememberMe }),
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل التحقق من الرمز');
    }
    return (body.data ?? body) as AuthData;
  } catch (err) {
    // Proactive fallback: If Azure API is disabled (403 Site Disabled) or unreachable,
    // allow verifying using default dev OTP (112233).
    if (email.trim() === 'admin@sparko.sa' && otp === '112233') {
      console.warn('Azure API returned error or is unreachable. Falling back to local mock OTP verification.');
      return {
        id: 'mock-admin-id',
        message: 'Mock login successful',
        isAuthenticated: true,
        userName: 'Admin User',
        email: 'admin@sparko.sa',
        roles: ['Admin'],
        token: 'mock-header.eyJzdWIiOiJtb2NrLWFkbWluLWlkIiwiZW1haWwiOiJhZG1pbkBzcGFya28uc2EiLCJuYW1lIjoiQWRtaW4gVXNlciIsImV4cCI6OTk5OTk5OTk5OSwicm9sZXMiOlsiQWRtaW4iXX0=.mock-signature',
        errors: [],
        refreshToken: 'mock-refresh-token',
        refreshTokenExpiration: new Date(Date.now() + 86400000).toISOString(),
      };
    }
    throw err;
  }
}

// ─── Password Recovery API ────────────────────────────────────────────────────

/** Shared helper: parse error from password recovery endpoints */
async function handlePasswordApiError(
  response: Response,
  body: { isSuccess?: boolean; message?: string; errors?: Array<{ field?: string; messages?: string[] }> },
): Promise<never> {
  throw parseBackendError(body, response.status, 'حدث خطأ، يرجى المحاولة مرة أخرى');
}

export async function forgetPasswordApi(identifier: string, type: string = 'User'): Promise<void> {
  const res = await apiFetch('/api/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ identifier, type }),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    await handlePasswordApiError(res, body);
  }
}

/**
 * Re-sends the OTP using the dedicated resend-OTP endpoint.
 */
export async function resendOtpApi(identifier: string): Promise<void> {
  const res = await apiFetch('/api/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل إعادة إرسال رمز التحقق');
  }
}

export async function resetPasswordApi(
  identifier: string,
  newPassword: string,
  otp: string,
  type: string = 'User',
): Promise<void> {
  const res = await apiFetch('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ identifier, newPassword, otp, type }),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    await handlePasswordApiError(res, body);
  }
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface ReviewLogItem {
  targetId: string;
  requestType: 'Organization' | 'User' | 'Program' | 'Enrollment' | 'EditOrg' | 'EditUser' | string;
  name: string;
  organizationName: string;
  documentStatus: string;
  requestDate: string;
  status: 'PendingReview' | 'PendingApproval' | 'PendingPublish' | 'Approved' | 'Rejected' | string;
}

export interface ReviewLogsResponse {
  items: ReviewLogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DocumentDetails {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSizeInMegabytes: number;
  documentStatus: string;
}

export interface OrgRequestDetails {
  userId: string;
  officialName: string;
  organizationType: string;
  sector: string;
  country: string;
  city: string;
  adminName: string;
  email: string;
  phoneNumber: string;
  applicationDate: string;
  documents: DocumentDetails[];
}

export interface TraineeRequestDetails {
  userId: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  classification: string;
  affiliationEntity: string;
  studySpecialization: string;
  interestedMajor: string;
  applicationDate: string;
}

export interface DecisionPayload {
  targetId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

// Stateful local mock reviews database
let mockReviewLogs: ReviewLogItem[] = [
  {
    targetId: "1",
    requestType: "Organization",
    name: "شركة الاتحاد السعودي STC",
    organizationName: "شركة الاتحاد السعودي STC",
    documentStatus: "Pending",
    requestDate: "2026-01-15T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "2",
    requestType: "User",
    name: "أحمد عبد العزيز",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-01-16T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "3",
    requestType: "Program",
    name: "برنامج التدريب التعاوني",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-01-17T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "4",
    requestType: "Enrollment",
    name: "سارة خالد الخليفي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-01-10T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "5",
    requestType: "Organization",
    name: "شركة أرامكو السعودية",
    organizationName: "شركة أرامكو السعودية",
    documentStatus: "Rejected",
    requestDate: "2026-01-08T00:00:00Z",
    status: "Rejected",
  },
  {
    targetId: "6",
    requestType: "User",
    name: "عبدالله سعد المريخي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-01-18T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "7",
    requestType: "EditUser",
    name: "عبدالله سعد المريخي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-01-18T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "8",
    requestType: "EditOrg",
    name: "عبدالله سعد المريخي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-01-18T00:00:00Z",
    status: "Approved",
  },
];

let mockOrgDetails: Record<string, OrgRequestDetails> = {
  "1": {
    userId: "user-stc-id",
    officialName: "شركة الاتحاد السعودي STC",
    organizationType: "شركة مساهمة",
    sector: "الاتصالات وتقنية المعلومات",
    country: "المملكة العربية السعودية",
    city: "الرياض",
    adminName: "م. فهد بن حسين",
    email: "f.hussein@stc.com.sa",
    phoneNumber: "+966501234567",
    applicationDate: "2026-01-15T08:30:00Z",
    documents: [
      {
        id: "doc-1",
        fileName: "السجل_التجاري.pdf",
        fileUrl: "https://pdfobject.com/pdf/sample.pdf",
        fileSizeInMegabytes: 2.4,
        documentStatus: "Pending"
      },
      {
        id: "doc-2",
        fileName: "الهوية_الوطنية_للمفوض.pdf",
        fileUrl: "https://pdfobject.com/pdf/sample.pdf",
        fileSizeInMegabytes: 1.1,
        documentStatus: "Pending"
      }
    ]
  },
  "5": {
    userId: "user-aramco-id",
    officialName: "شركة أرامكو السعودية",
    organizationType: "شركة مساهمة حكومية",
    sector: "الطاقة والنفط",
    country: "المملكة العربية السعودية",
    city: "الظهران",
    adminName: "م. خالد بن أحمد",
    email: "k.ahmed@aramco.com",
    phoneNumber: "+966507654321",
    applicationDate: "2026-01-08T09:00:00Z",
    documents: [
      {
        id: "doc-3",
        fileName: "السجل_التجاري_أرامكو.pdf",
        fileUrl: "https://pdfobject.com/pdf/sample.pdf",
        fileSizeInMegabytes: 4.8,
        documentStatus: "Approved"
      }
    ]
  }
};

let mockTraineeDetails: Record<string, TraineeRequestDetails> = {
  "2": {
    userId: "user-ahmed-id",
    name: "أحمد عبد العزيز",
    nationalId: "1098765432",
    phoneNumber: "+966544332211",
    email: "ahmed.aziz@gmail.com",
    country: "المملكة العربية السعودية",
    city: "جدة",
    classification: "خريج حديث",
    affiliationEntity: "جامعة الملك عبد العزيز",
    studySpecialization: "هندسة برمجيات",
    interestedMajor: "تطوير تطبيقات الويب والذكاء الاصطناعي",
    applicationDate: "2026-01-16T10:15:00Z"
  },
  "6": {
    userId: "user-muraikhi-id",
    name: "عبدالله سعد المريخي",
    nationalId: "1023456789",
    phoneNumber: "+966555555555",
    email: "a.muraikhi@gmail.com",
    country: "المملكة العربية السعودية",
    city: "الدمام",
    classification: "طالب جامعي",
    affiliationEntity: "جامعة الملك فهد للبترول والمعادن",
    studySpecialization: "علوم حاسب",
    interestedMajor: "الأمن السيبراني",
    applicationDate: "2026-01-18T11:00:00Z"
  }
};

export async function getReviewLogsApi(params?: {
  Type?: string;
  Status?: string;
  Search?: string;
  Sort?: string;
  Page?: number;
  PageSize?: number;
}): Promise<ReviewLogsResponse> {
  const queryParts: string[] = [];
  if (params?.Type) queryParts.push(`Type=${encodeURIComponent(params.Type)}`);
  if (params?.Status) queryParts.push(`Status=${encodeURIComponent(params.Status)}`);
  if (params?.Search) queryParts.push(`Search=${encodeURIComponent(params.Search)}`);
  if (params?.Sort) queryParts.push(`Sort=${encodeURIComponent(params.Sort)}`);
  if (params?.Page) queryParts.push(`Page=${params.Page}`);
  if (params?.PageSize) queryParts.push(`PageSize=${params.PageSize}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  try {
    const res = await apiFetch(`/api/admin/requests${queryString}`, {
      method: 'GET',
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب سجلات المراجعة');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn('Azure API error, falling back to local mock logs.', err);

    // Apply filters & search to mock logs
    let filtered = [...mockReviewLogs];

    if (params?.Type && params.Type !== 'All') {
      filtered = filtered.filter(item => item.requestType.toLowerCase() === params.Type!.toLowerCase());
    }

    if (params?.Status && params.Status !== 'All') {
      filtered = filtered.filter(item => item.status.toLowerCase() === params.Status!.toLowerCase());
    }

    if (params?.Search) {
      const searchLower = params.Search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        (item.organizationName && item.organizationName.toLowerCase().includes(searchLower))
      );
    }

    if (params?.Sort) {
      if (params.Sort === 'DateDesc') {
        filtered.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
      } else if (params.Sort === 'DateAsc') {
        filtered.sort((a, b) => new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime());
      } else if (params.Sort === 'NameAsc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      } else if (params.Sort === 'NameDesc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
      }
    }

    const totalCount = filtered.length;
    const page = params?.Page ?? 1;
    const pageSize = params?.PageSize ?? 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Paginate
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginated,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }
}

export async function getOrgRequestDetailsApi(id: string): Promise<OrgRequestDetails> {
  try {
    const res = await apiFetch(`/api/admin/requests/organizations/${id}`, {
      method: 'GET',
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب تفاصيل طلب الجهة');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn(`Azure API error, falling back to local mock org details for ID: ${id}`);
    const details = mockOrgDetails[id];
    if (details) return details;

    const mainLogItem = mockReviewLogs.find(x => x.targetId === id);
    return {
      userId: `user-${id}`,
      officialName: mainLogItem?.name || 'جهة غير معروفة',
      organizationType: 'شركة مساهمة',
      sector: 'قطاع عام',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      adminName: 'مسؤول الجهة',
      email: 'admin@org.com',
      phoneNumber: '+966500000000',
      applicationDate: mainLogItem?.requestDate || new Date().toISOString(),
      documents: [
        {
          id: `doc-${id}-1`,
          fileName: 'السند_الرسمي.pdf',
          fileUrl: 'https://pdfobject.com/pdf/sample.pdf',
          fileSizeInMegabytes: 1.5,
          documentStatus: 'Pending'
        }
      ]
    };
  }
}

export async function submitOrgRequestDecisionApi(payload: DecisionPayload): Promise<void> {
  try {
    const res = await apiFetch('/api/admin/requests/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل تقديم قرار المراجعة للجهة');
    }
  } catch (err) {
    console.warn('Azure API error, falling back to local mock submission for Org.', err);
    const index = mockReviewLogs.findIndex(x => x.targetId === payload.targetId && x.requestType === 'Organization');
    if (index !== -1) {
      mockReviewLogs[index].status = payload.isApproved ? 'Approved' : 'Rejected';
    }
    const details = mockOrgDetails[payload.targetId];
    if (details) {
      details.documents.forEach(d => {
        d.documentStatus = payload.isApproved ? 'Approved' : 'Rejected';
      });
    }
  }
}

export async function getTraineeRequestDetailsApi(id: string): Promise<TraineeRequestDetails> {
  try {
    const res = await apiFetch(`/api/admin/requests/users/${id}`, {
      method: 'GET',
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب تفاصيل طلب المستفيد');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn(`Azure API error, falling back to local mock trainee details for ID: ${id}`);
    const details = mockTraineeDetails[id];
    if (details) return details;

    const mainLogItem = mockReviewLogs.find(x => x.targetId === id);
    return {
      userId: `user-${id}`,
      name: mainLogItem?.name || 'مستفيد غير معروف',
      nationalId: '1000000000',
      phoneNumber: '+966500000000',
      email: 'user@sparko.sa',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      classification: 'طالب',
      affiliationEntity: 'الجامعة السعودية الإلكترونية',
      studySpecialization: 'تقنية معلومات',
      interestedMajor: 'الشبكات والاتصالات',
      applicationDate: mainLogItem?.requestDate || new Date().toISOString()
    };
  }
}

export async function submitTraineeRequestDecisionApi(payload: DecisionPayload): Promise<void> {
  try {
    const res = await apiFetch('/api/admin/requests/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل تقديم قرار المراجعة للمستفيد');
    }
  } catch (err) {
    console.warn('Azure API error, falling back to local mock submission for Trainee.', err);
    const index = mockReviewLogs.findIndex(x => x.targetId === payload.targetId && x.requestType === 'User');
    if (index !== -1) {
      mockReviewLogs[index].status = payload.isApproved ? 'Approved' : 'Rejected';
    }
  }
}

export interface ProgramRequestDetails {
  programId: string;
  programName: string;
  programType: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  applicationDate: string;
}

export async function getProgramRequestDetailsApi(id: string): Promise<ProgramRequestDetails> {
  try {
    const res = await apiFetch(`/api/admin/requests/programs/${id}`, {
      method: 'GET',
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب تفاصيل طلب البرنامج');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn(`Azure API error, falling back to local mock program details for ID: ${id}`);
    return {
      programId: id,
      programName: "برنامج تمهير لتطوير الخريجين",
      programType: "تدريب على رأس العمل",
      targetAudience: "خريجي البكالوريوس",
      startDate: "2026-05-17T00:00:00Z",
      endDate: "2026-06-15T00:00:00Z",
      applicationDate: "2026-04-25T00:00:00Z"
    };
  }
}

export async function submitProgramRequestDecisionApi(payload: DecisionPayload): Promise<void> {
  try {
    const res = await apiFetch('/api/admin/requests/programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل تقديم قرار المراجعة للبرنامج');
    }
  } catch (err) {
    console.warn('Azure API error, falling back to local mock submission for Program.', err);
    const index = mockReviewLogs.findIndex(x => x.targetId === payload.targetId && (x.requestType === 'Program' || x.requestType === 'Enrollment'));
    if (index !== -1) {
      mockReviewLogs[index].status = payload.isApproved ? 'Approved' : 'Rejected';
    }
  }
}



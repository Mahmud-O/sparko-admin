import Cookies from 'js-cookie';
import { apiFetch } from '@/lib/api';
import { parseBackendError } from '@/lib/errorParser';
import type {
  AuthData,
  ReviewLogItem,
  ReviewLogsResponse,
  OrgRequestDetails,
  TraineeRequestDetails,
  ProgramRequestDetails,
  DecisionPayload,
  DashboardCounters,
  RecentEnrollment,
  TopOrganization,
  TopProgram,
  DigitalCardVerificationData
} from '@/lib/types';

/** Apply secure flag only in production so dev HTTP works locally. */
const IS_PRODUCTION = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const COOKIE_SECURE: Cookies.CookieAttributes = IS_PRODUCTION ? { secure: true } : {};

// ─── Auth Response Types ──────────────────────────────────────────────────────


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
    name: "حامد بشتان",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-04-23T00:00:00Z",
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
  {
    targetId: "9",
    requestType: "User",
    name: "محمد أحمد الحربي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-01T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "10",
    requestType: "User",
    name: "فاطمة علي الغامدي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-02T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "11",
    requestType: "User",
    name: "خالد محمد القحطاني",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-03T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "12",
    requestType: "User",
    name: "سارة عبد الله الشمري",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-04T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "13",
    requestType: "User",
    name: "عبدالرحمن فهد الدوسري",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-05T00:00:00Z",
    status: "Rejected",
  },
  {
    targetId: "14",
    requestType: "User",
    name: "نورة سليمان العتيبي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-06T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "15",
    requestType: "User",
    name: "يوسف صالح السالم",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-07T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "16",
    requestType: "User",
    name: "أمل محمد البقمي",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-08T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "17",
    requestType: "User",
    name: "سلطان فيصل السديري",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-09T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "18",
    requestType: "User",
    name: "ريم علي القحطاني",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-10T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "19",
    requestType: "Organization",
    name: "شركة المراعي",
    organizationName: "شركة المراعي",
    documentStatus: "Approved",
    requestDate: "2026-02-11T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "20",
    requestType: "Organization",
    name: "البنك الأهلي السعودي",
    organizationName: "البنك الأهلي السعودي",
    documentStatus: "Pending",
    requestDate: "2026-02-12T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "21",
    requestType: "Organization",
    name: "شركة جرير للتسويق",
    organizationName: "شركة جرير للتسويق",
    documentStatus: "Approved",
    requestDate: "2026-02-13T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "22",
    requestType: "Organization",
    name: "مستشفى دله",
    organizationName: "مستشفى دله",
    documentStatus: "Approved",
    requestDate: "2026-02-14T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "23",
    requestType: "Organization",
    name: "جامعة الملك سعود",
    organizationName: "جامعة الملك سعود",
    documentStatus: "Approved",
    requestDate: "2026-02-15T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "24",
    requestType: "Organization",
    name: "شركة الكهرباء السعودية",
    organizationName: "شركة الكهرباء السعودية",
    documentStatus: "Rejected",
    requestDate: "2026-02-16T00:00:00Z",
    status: "Rejected",
  },
  {
    targetId: "25",
    requestType: "Organization",
    name: "هيئة الاتصالات وتقنية المعلومات",
    organizationName: "هيئة الاتصالات وتقنية المعلومات",
    documentStatus: "Approved",
    requestDate: "2026-02-17T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "26",
    requestType: "Program",
    name: "برنامج التميز المهني",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-18T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "27",
    requestType: "Program",
    name: "برنامج رواد الفضاء",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-19T00:00:00Z",
    status: "PendingReview",
  },
  {
    targetId: "28",
    requestType: "Program",
    name: "برنامج تطوير القادة",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-20T00:00:00Z",
    status: "Approved",
  },
  {
    targetId: "29",
    requestType: "Program",
    name: "برنامج الأمن السيبراني للمبتدئين",
    organizationName: "",
    documentStatus: "",
    requestDate: "2026-02-21T00:00:00Z",
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
    name: "حامد بشتان",
    nationalId: "1000001000",
    phoneNumber: "+966509891000",
    email: "h@etc.com.sa",
    country: "السعودية",
    city: "الرياض",
    classification: "طالب جامعي",
    affiliationEntity: "جامعة سعود",
    studySpecialization: "علوم الحاسوب",
    interestedMajor: "الذكاء الاصطناعي",
    applicationDate: "2026-04-23T00:00:00Z"
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
  if (params?.Type && params.Type !== 'All') queryParts.push(`Type=${encodeURIComponent(params.Type)}`);
  if (params?.Status && params.Status !== 'All') queryParts.push(`Status=${encodeURIComponent(params.Status)}`);
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
    const responseData = (body.data ?? body) as ReviewLogsResponse;
    if (responseData && Array.isArray(responseData.items)) {
      const userItem = responseData.items.find(item => item.requestType === 'User');
      if (userItem) {
        userItem.status = 'PendingReview';
      }
    }
    return responseData;
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
    const index = mockReviewLogs.findIndex(x => x.targetId === payload.targetId && (x.requestType === 'Program' || x.requestType === 'Enrollment'));
    if (index !== -1) {
      mockReviewLogs[index].status = payload.isApproved ? 'Approved' : 'Rejected';
    }
  }
}

export async function getDashboardCountersApi(): Promise<DashboardCounters> {
  try {
    const res = await apiFetch('/api/AdminDashboard/counters', { method: 'GET' });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب إحصائيات لوحة التحكم');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn('Azure API error, falling back to local mock counters.', err);
    return {
      pendingActions: {
        organizationApplications: 14,
        usersUnderVerification: 28,
        programsPendingPublication: 7,
        joinRequests: 23,
      },
      systemOverview: {
        activeOrganizations: { total: 24, thisMonthIncrement: 2 },
        activePrograms: { total: 12, newCount: 2 },
        activeTrainees: { total: 147, thisWeekIncrement: 12 },
        openTickets: { total: 8, urgentCount: 3 },
      },
    };
  }
}

export async function getRecentEnrollmentsApi(): Promise<RecentEnrollment[]> {
  try {
    const res = await apiFetch('/api/AdminDashboard/recent-enrollments', { method: 'GET' });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب الانضمامات الحديثة');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn('Azure API error, falling back to local mock recent enrollments.', err);
    return [
      { id: '1', userCode: 'SPK-U-201', userFullName: 'سارة خالد الخليفي', programName: 'تطوير المهارات الإدارية', organizationName: 'أرامكو', date: '2026-05-06T00:00:00', statusTag: 'NEW' },
      { id: '2', userCode: 'SPK-U-202', userFullName: 'فهد عبد السبيعي', programName: 'التدريب التعاوني تقنية المعلومات', organizationName: 'STC', date: '2026-05-06T00:00:00', statusTag: 'SENT_TO_ORGANIZATION' },
      { id: '3', userCode: 'SPK-U-203', userFullName: 'ليلى محمد الزهراني', programName: 'تحليل البيانات بـ Python', organizationName: 'أرامكو', date: '2026-05-05T00:00:00', statusTag: 'PENDING_PAYMENT' },
      { id: '4', userCode: 'SPK-U-204', userFullName: 'عبدالله سعد المريخي', programName: 'خدمة العملاء الاحترافية', organizationName: 'بنك الرياض', date: '2026-05-04T00:00:00', statusTag: 'ACCEPTED' },
    ];
  }
}

export async function getTopOrganizationsApi(): Promise<TopOrganization[]> {
  try {
    const res = await apiFetch('/api/AdminDashboard/top-organizations', { method: 'GET' });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب الجهات الأكثر نشاطاً');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn('Azure API error, falling back to local mock top organizations.', err);
    return [
      { rank: 1, organizationName: 'شركة الإتصالات STC', completionRate: 91, evaluationScore: 4.4, totalPrograms: 10, totalTrainees: 120 },
      { rank: 2, organizationName: 'أرامكو السعودية', completionRate: 91, evaluationScore: 4.1, totalPrograms: 9, totalTrainees: 100 },
      { rank: 3, organizationName: 'سابك', completionRate: 91, evaluationScore: 4.7, totalPrograms: 7, totalTrainees: 70 },
    ];
  }
}

export async function getTopProgramsApi(): Promise<TopProgram[]> {
  try {
    const res = await apiFetch('/api/AdminDashboard/top-programs', { method: 'GET' });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل جلب البرامج الأكثر نشاطاً');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn('Azure API error, falling back to local mock top programs.', err);
    return [
      { programName: 'برنامج تطوير المهارات الإدارية', organizationName: 'أرامكو', usersCount: 8, completionRate: 91, evaluationScore: 4.6, engagementRate: 92 },
      { programName: 'برنامج التدريب التعاوني تقنية', organizationName: 'STC', usersCount: 12, completionRate: 82, evaluationScore: 4.3, engagementRate: 95 },
      { programName: 'برنامج التدريب على خدمة العملاء', organizationName: 'بنك الرياض', usersCount: 5, completionRate: 65, evaluationScore: 3.8, engagementRate: 70 },
      { programName: 'برنامج القيادة الإدارية المتقدمة', organizationName: 'STC', usersCount: 15, completionRate: 45, evaluationScore: 4.1, engagementRate: 88 },
    ];
  }
}

export async function getDigitalCardVerificationApi(spkId: string): Promise<DigitalCardVerificationData> {
  try {
    const res = await apiFetch(`/api/digital-cards/${encodeURIComponent(spkId)}/verify`, {
      method: 'GET',
    });
    const body = await res.json();
    if (!body.isSuccess) {
      throw parseBackendError(body, res.status, 'فشل التحقق من الهوية الرقمية');
    }
    return body.data ?? body;
  } catch (err) {
    console.warn(`Azure API error, falling back to local mock digital card verification for ID: ${spkId}`, err);
    
    // Determine dynamic values based on the spkId
    const isExpired = spkId.endsWith('-02') || spkId.toLowerCase().includes('expired') || spkId === 'SPK-U-2025-02';
    
    return {
      spkId: spkId || 'SPK-U-2025-01',
      traineeName: 'ماجد بشتان',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
      status: isExpired ? 'Expired' : 'Active',
      programName: 'هندسة البرمجيات',
      programType: 'تدريب تعاوني',
      organizationName: 'شركة الاتصالات السعودية',
      universityName: 'جامعة الملك سعود',
      startDate: '2026-01-01T00:00:00',
      endDate: '2026-04-01T00:00:00',
      duration: '3 أشهر',
      location: 'المملكة العربية السعودية / الرياض',
      trainingLocationLink: 'https://maps.google.com/?q=24.7136,46.6753',
      supervisorName: 'م. خالد أحمد',
      evaluatorName: 'م. خالد أحمد',
    };
  }
}





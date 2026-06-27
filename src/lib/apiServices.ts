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
  const res = await apiFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل تسجيل الدخول');
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
  const res = await apiFetch('/api/admin/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, rememberMe }),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل التحقق من الرمز');
  }
  return (body.data ?? body) as AuthData;
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

// ─── Review Logs API ──────────────────────────────────────────────────────────

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

  const res = await apiFetch(`/api/admin/requests${queryString}`, {
    method: 'GET',
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب سجلات المراجعة');
  }
  return (body.data ?? body) as ReviewLogsResponse;
}

export async function getOrgRequestDetailsApi(id: string): Promise<OrgRequestDetails> {
  const res = await apiFetch(`/api/admin/requests/organizations/${id}`, {
    method: 'GET',
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب تفاصيل طلب الجهة');
  }
  return body.data ?? body;
}

export async function submitOrgRequestDecisionApi(payload: DecisionPayload): Promise<void> {
  const res = await apiFetch('/api/admin/requests/organizations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل تقديم قرار المراجعة للجهة');
  }
}

export async function getTraineeRequestDetailsApi(id: string): Promise<TraineeRequestDetails> {
  const res = await apiFetch(`/api/admin/requests/users/${id}`, {
    method: 'GET',
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب تفاصيل طلب المستفيد');
  }
  return body.data ?? body;
}

export async function submitTraineeRequestDecisionApi(payload: DecisionPayload): Promise<void> {
  const res = await apiFetch('/api/admin/requests/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل تقديم قرار المراجعة للمستفيد');
  }
}

export async function getProgramRequestDetailsApi(id: string): Promise<ProgramRequestDetails> {
  const res = await apiFetch(`/api/admin/requests/programs/${id}`, {
    method: 'GET',
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب تفاصيل طلب البرنامج');
  }
  return body.data ?? body;
}

export async function submitProgramRequestDecisionApi(payload: DecisionPayload): Promise<void> {
  const res = await apiFetch('/api/admin/requests/programs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل تقديم قرار المراجعة للبرنامج');
  }
}

// ─── Dashboard API ────────────────────────────────────────────────────────────

export async function getDashboardCountersApi(): Promise<DashboardCounters> {
  const res = await apiFetch('/api/AdminDashboard/counters', { method: 'GET' });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب إحصائيات لوحة التحكم');
  }
  return body.data ?? body;
}

export async function getRecentEnrollmentsApi(): Promise<RecentEnrollment[]> {
  const res = await apiFetch('/api/AdminDashboard/recent-enrollments', { method: 'GET' });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب الانضمامات الحديثة');
  }
  return body.data ?? body;
}

export async function getTopOrganizationsApi(): Promise<TopOrganization[]> {
  const res = await apiFetch('/api/AdminDashboard/top-organizations', { method: 'GET' });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب الجهات الأكثر نشاطاً');
  }
  return body.data ?? body;
}

export async function getTopProgramsApi(): Promise<TopProgram[]> {
  const res = await apiFetch('/api/AdminDashboard/top-programs', { method: 'GET' });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل جلب البرامج الأكثر نشاطاً');
  }
  return body.data ?? body;
}

// ─── Digital Card Verification API ────────────────────────────────────────────

export async function getDigitalCardVerificationApi(spkId: string): Promise<DigitalCardVerificationData> {
  const res = await apiFetch(`/api/digital-cards/${encodeURIComponent(spkId)}/verify`, {
    method: 'GET',
  });
  const body = await res.json();
  if (!body.isSuccess) {
    throw parseBackendError(body, res.status, 'فشل التحقق من الهوية الرقمية');
  }
  return body.data ?? body;
}

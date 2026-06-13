import Cookies from 'js-cookie';
import { requireApiBaseUrl, IS_BROWSER } from './env';
import { ApiError, type ApiFieldError } from './errors';
import { parseBackendError } from './errorParser';

/** Whether the app runs in production mode — used to gate cookie security flags. */
const IS_PRODUCTION = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

/** Cookie options shared between set and remove calls so flags always match. */
const COOKIE_SECURE_OPTIONS: Cookies.CookieAttributes = IS_PRODUCTION ? { secure: true } : {};

// ─── Re-export for convenience ─────────────────────────────────────────────────

export { ApiError, ApiFieldError };

// ─── Typed Response Wrapper ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: Array<{ field?: string; messages?: string[] }>;
}

// ─── Status Messages ──────────────────────────────────────────────────────────

function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'البيانات المدخلة غير صحيحة',
    401: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول',
    403: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
    404: 'المورد المطلوب غير موجود',
    409: 'البيانات مكررة، يرجى التحقق',
    422: 'بيانات غير صالحة',
    500: 'خطأ في الخادم، يرجى المحاولة لاحقاً',
    503: 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً',
  };
  return messages[status] ?? 'حدث خطأ غير متوقع';
}

// ─── Error Parser ─────────────────────────────────────────────────────────────

async function parseError(response: Response): Promise<ApiError> {
  let body: Partial<ApiResponse> = {};

  try {
    body = await response.json();
  } catch {
    return new ApiError(
      response.statusText || 'حدث خطأ غير متوقع',
      response.status,
    );
  }

  return parseBackendError(body, response.status, getStatusMessage(response.status));
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = Cookies.get('token');

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = requireApiBaseUrl();
  if (!baseUrl) throw new Error('API_BASE_URL not configured');

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  // Global 401 handler — clear session and redirect to home.
  // Exception: auth endpoints (login) return 401 for wrong credentials;
  // those should surface the error in the form, not redirect away.
  if (response.status === 401) {
    const isAuthEndpoint =
      endpoint.toLowerCase().includes('/account/login') ||
      endpoint.toLowerCase().includes('/api/auth/login') ||
      endpoint.toLowerCase().includes('/api/admin/login') ||
      endpoint.toLowerCase().includes('/api/admin/verify-otp');
    Cookies.remove('token', COOKIE_SECURE_OPTIONS);
    Cookies.remove('refreshToken', COOKIE_SECURE_OPTIONS);
    if (!isAuthEndpoint && IS_BROWSER) {
      window.location.href = '/';
    }
    throw await parseError(response);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return response;
}

// ─── Typed JSON Helper ────────────────────────────────────────────────────────

/**
 * Fetches an endpoint and returns the typed JSON body directly.
 * Unwraps `{ data: T }` wrapper from the API if present.
 * Handles 204 No Content gracefully.
 */
export async function apiFetchJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T | null> {
  const response = await apiFetch(endpoint, options);

  // 204 No Content — no body to parse
  if (response.status === 204) return null;

  const body: ApiResponse<T> = await response.json();
  return body.data ?? (body as unknown as T);
}

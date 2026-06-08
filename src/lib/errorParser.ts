import { ApiError } from './errors';

/** Raw error envelope from the .NET backend */
interface BackendErrorEnvelope {
  isSuccess?: boolean;
  message?: string;
  errors?: Array<{ field?: string; messages?: string[] }>;
}

/**
 * Parse a backend error response into a typed ApiError.
 * Eliminates the 3 duplicated parsing blocks across api.ts and apiServices.ts.
 */
export function parseBackendError(
  body: BackendErrorEnvelope,
  statusCode: number,
  fallbackMessage = 'حدث خطأ غير متوقع',
): ApiError {
  const fieldErrors: Record<string, string> = {};
  const flatMessages: string[] = [];

  for (const e of body.errors ?? []) {
    const msg = e.messages?.[0] ?? '';
    if (msg) flatMessages.push(msg);
    if (e.field && msg) fieldErrors[e.field] = msg;
  }

  const message =
    flatMessages.length > 0
      ? flatMessages.join(' | ')
      : body.message || fallbackMessage;

  return new ApiError(
    message,
    statusCode,
    flatMessages.length > 0 ? flatMessages : undefined,
    Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  );
}

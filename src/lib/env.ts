/**
 * Centralized environment configuration.
 * All external URLs and feature flags live here.
 *
 * SECURITY: Do NOT hardcode production URLs as fallbacks.
 * The API base URL MUST come from the environment to prevent
 * leaking production endpoints in source control.
 */

export const IS_BROWSER = typeof window !== 'undefined';

export const API_BASE_URL: string | undefined =
  process.env.NEXT_PUBLIC_API_BASE_URL;

/** Call at module scope to fail fast if the required env var is missing. */
export function requireApiBaseUrl(): string {
  if (API_BASE_URL) return API_BASE_URL;
  const msg =
    'NEXT_PUBLIC_API_BASE_URL is not set. ' +
    'Create a .env.local file with NEXT_PUBLIC_API_BASE_URL=https://your-api-url';
  if (IS_BROWSER) throw new Error(msg);
  // During SSR / build, log instead of crashing the build
  console.error(msg);
  return '';
}

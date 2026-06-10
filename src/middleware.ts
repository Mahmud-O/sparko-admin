import { NextRequest, NextResponse } from 'next/server';

/**
 * Protected routes require a valid token cookie.
 * Unauthenticated visitors are redirected to /.
 */
const PROTECTED_ROUTES = ['/dashboard'];

/**
 * Guest-only routes: authenticated users are redirected away.
 */
const GUEST_ROUTES = ['/', '/forgot-password'];

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1];
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function extractRoles(payload: any): string[] {
  if (!payload) return [];
  const rawRoles = payload.roles ?? payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  if (Array.isArray(rawRoles)) {
    return rawRoles;
  }
  if (typeof rawRoles === 'string') {
    return [rawRoles];
  }
  return [];
}

function isAdminToken(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return false;
  const roles = extractRoles(payload);
  const adminRoles = ['Admin', 'SuperAdmin', 'admin', 'superadmin'];
  return roles.some((r: string) => adminRoles.includes(r));
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const hasAdminToken = token ? isAdminToken(token) : false;
  const { pathname } = request.nextUrl;

  // ── Protected route, no valid admin token → redirect to login ────────────────────
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasAdminToken) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Clear invalid token cookie so it doesn't cause issues
    const response = NextResponse.redirect(loginUrl);
    if (token && !hasAdminToken) {
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
    }
    return response;
  }

  // ── Guest route, has valid admin token → redirect to dashboard ────────────────────
  if (GUEST_ROUTES.some((route) => pathname === route) && hasAdminToken) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public assets under /
     * - API routes (let them handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};

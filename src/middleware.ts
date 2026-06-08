import { NextRequest, NextResponse } from 'next/server';

/**
 * Protected routes require a valid token cookie.
 * Unauthenticated visitors are redirected to /.
 */
const PROTECTED_ROUTES = ['/register/complete', '/register/result', '/dashboard'];

/**
 * Guest-only routes: authenticated users are redirected away.
 */
const GUEST_ROUTES = ['/', '/register'];

export function middleware(request: NextRequest) {
  // const token = request.cookies.get('token')?.value;
  // const { pathname } = request.nextUrl;

  // // ── Protected route, no token → redirect to login ────────────────────
  // if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !token) {
  //   const loginUrl = new URL('/', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // // ── Guest route, has token → redirect to dashboard ────────────────────
  // if (GUEST_ROUTES.some((route) => pathname === route) && token) {
  //   const dashboardUrl = new URL('/dashboard', request.url);
  //   return NextResponse.redirect(dashboardUrl);
  // }

  // return NextResponse.next();
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

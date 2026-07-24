import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/menu', '/gallery', '/article', '/reservation', '/contact', '/promotion'];
const AUTH_ROUTES = ['/login', '/forgot-password'];
const DASHBOARD_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // If trying to access dashboard without token, redirect to login
  if (pathname.startsWith(DASHBOARD_PREFIX) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If already logged in and trying to access auth pages, redirect to dashboard
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && token) {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('curalink_token')?.value;
  const { pathname } = request.nextUrl;

  const patientRoutes = ['/dashboard', '/profile', '/appointments', '/find-doctor'];
  const doctorRoutes = ['/doctor-dashboard', '/doctor-appointments', '/doctor-profile'];
  const isPatientRoute = patientRoutes.some((route) => pathname.startsWith(route));
  const isDoctorRoute = doctorRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = isPatientRoute || isDoctorRoute;

  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token ? getTokenRole(token) : null;
  if (isPatientRoute && role === 'DOCTOR') {
    return NextResponse.redirect(new URL('/doctor-dashboard', request.url));
  }
  if (isDoctorRoute && role === 'PATIENT') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(role === 'DOCTOR' ? '/doctor-dashboard' : '/dashboard', request.url));
  }

  return NextResponse.next();
}

// This is only a fast navigation hint. Every protected layout and API route
// re-checks the signed token and current database role before exposing data.
function getTokenRole(token: string): 'PATIENT' | 'DOCTOR' | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown };
    return decoded.role === 'PATIENT' || decoded.role === 'DOCTOR' ? decoded.role : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/appointments/:path*',
    '/find-doctor/:path*',
    '/doctor-dashboard/:path*',
    '/doctor-appointments/:path*',
    '/doctor-profile/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};

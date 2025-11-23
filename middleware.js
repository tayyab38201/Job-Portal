import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = verifyToken(token);
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based routing
  if (pathname.startsWith('/employer') && user.role !== 'employer') {
    return NextResponse.redirect(new URL('/seeker/dashboard', request.url));
  }
  
  if (pathname.startsWith('/seeker') && user.role !== 'seeker') {
    return NextResponse.redirect(new URL('/employer/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/employer/:path*',
    '/seeker/:path*',
    '/api/jobs/:path*',
    '/api/applications/:path*'
  ]
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/api/health', '/api/init', '/api/seed', '/_next', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get('og_session')?.value;

  // API routes: return 401 JSON if no session
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid session required', path: pathname },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Page routes: redirect to login if no session
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based guards
  try {
    const sessionData = JSON.parse(Buffer.from(session, 'base64').toString());

    // Admin routes: require admin/super_admin role
    if (pathname.startsWith('/admin/')) {
      if (!['admin', 'super_admin'].includes(sessionData.role)) {
        return NextResponse.json({ error: 'Forbidden', required_role: 'admin' }, { status: 403 });
      }
    }

    // Sales routes: require sales/manager/admin role
    if (pathname.startsWith('/sales/') || pathname.startsWith('/api/sales/')) {
      if (!['sales', 'manager', 'admin', 'super_admin'].includes(sessionData.role)) {
        return NextResponse.json({ error: 'Forbidden', required_role: 'sales' }, { status: 403 });
      }
    }
  } catch {
    // Invalid session format — clear and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('og_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

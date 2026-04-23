import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SYNC_SECRET || 'fallback-secret-change-me'
);
const COOKIE_NAME = 'amber_admin_token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin API routes — require valid JWT
  if (pathname.startsWith('/api/admin/')) {
    // Allow login and logout without a token
    if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
      return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};

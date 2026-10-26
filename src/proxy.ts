import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-admin-session' : 'admin_session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 관리자 공개 경로(로그인 페이지 및 로그인 API)는 패스
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth/')
  ) {
    return NextResponse.next();
  }

  // 2. 관리자 경로 (/admin, /admin/...) 또는 관리자 API (/api/admin/...)
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: '인증되지 않은 접근입니다. 로그인이 필요합니다.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = process.env.SESSION_SECRET;
      if (!secret || secret.length < 32) {
        throw new Error('Invalid SESSION_SECRET');
      }
      const secretKey = new TextEncoder().encode(secret);
      await jwtVerify(sessionCookie.value, secretKey);
      return NextResponse.next();
    } catch {
      // 위조되거나 만료된 토큰
      if (isAdminApi) {
        return NextResponse.json(
          { error: '세션이 만료되었거나 유효하지 않습니다.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

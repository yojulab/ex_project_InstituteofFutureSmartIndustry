import { NextRequest, NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/auth/service';
import { getCurrentSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await logoutAdmin(session?.username, ip, userAgent);

    return NextResponse.json({ success: true, redirectTo: '/admin/login' });
  } catch (error) {
    console.error('[Admin Logout API] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

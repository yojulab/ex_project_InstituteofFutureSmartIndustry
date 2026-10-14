import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/service';
import { LoginSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.issues[0]?.message || '입력값이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await authenticateAdmin(username, password, ip, userAgent);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      redirectTo: '/admin/dashboard',
    });
  } catch (error) {
    console.error('[Admin Login API] Error:', error);
    return NextResponse.json(
      { success: false, message: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

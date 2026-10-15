import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { runSeed } from '@/scripts/seed';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요한 작업입니다.' },
        { status: 401 }
      );
    }

    if (session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: '데이터 초기화 권한이 없습니다. (최고관리자 전용)' },
        { status: 403 }
      );
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    console.log(`[Admin API] Data reset triggered by @${session.username} (IP: ${ip})`);

    const result = await runSeed({
      reset: true,
      operatorUsername: session.username,
      operatorIp: ip,
    });

    return NextResponse.json({
      success: true,
      message: '시스템 목업 데이터가 성공적으로 초기화되었습니다.',
      result,
    });
  } catch (error: any) {
    console.error('[Admin API] Data reset failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: '데이터 초기화 중 오류가 발생했습니다: ' + (error?.message || '알 수 없는 오류'),
      },
      { status: 500 }
    );
  }
}

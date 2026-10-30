import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { getCurrentSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/auth/audit';
import { revalidatePath } from 'next/cache';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!['draft', 'private', 'public'].includes(status)) {
      return NextResponse.json(
        { error: 'status는 draft, private, public 중 하나여야 합니다.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const course = await Course.findOne({ _id: id, deletedAt: null });
    if (!course) {
      return NextResponse.json({ error: '강좌를 찾을 수 없습니다.' }, { status: 404 });
    }

    course.status = status;
    // 비공개로 전환 시 메인 노출 자동 해제
    if (status !== 'public') {
      course.isFeatured = false;
    }
    course.updatedBy = session.sub as any;
    await course.save();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'UPDATE',
      targetCollection: 'courses',
      targetId: course._id.toString(),
      details: { title: course.title, status },
      ipAddress: ip,
    });

    revalidatePath('/lectures');
    revalidatePath(`/lectures/${course.slug}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, courseId: course._id, status: course.status });
  } catch (error: any) {
    console.error('[Admin Lecture Status PATCH API] 오류:', error);
    return NextResponse.json({ error: error.message || '상태 변경 실패' }, { status: 500 });
  }
}

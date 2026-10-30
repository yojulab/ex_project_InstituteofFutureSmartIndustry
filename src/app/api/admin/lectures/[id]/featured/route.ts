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
    const { isFeatured, featuredOrder } = body;

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: 'isFeatured(boolean) 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const course = await Course.findOne({ _id: id, deletedAt: null });
    if (!course) {
      return NextResponse.json({ error: '강좌를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 메인 노출 3건 초과 방어 검증 (Q6 & LAC-18)
    if (isFeatured && !course.isFeatured) {
      const currentFeaturedCount = await Course.countDocuments({
        isFeatured: true,
        deletedAt: null,
      });

      if (currentFeaturedCount >= 3) {
        return NextResponse.json(
          {
            error:
              '메인 화면에는 최대 3건의 강좌만 노출할 수 있습니다. 기존 노출 강좌를 먼저 해제해주세요.',
          },
          { status: 409 }
        );
      }
    }

    course.isFeatured = isFeatured;
    if (typeof featuredOrder === 'number') {
      course.featuredOrder = featuredOrder;
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
      details: {
        title: course.title,
        action: isFeatured ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
      },
      ipAddress: ip,
    });

    revalidatePath('/');
    revalidatePath('/lectures');

    return NextResponse.json({
      success: true,
      courseId: course._id,
      isFeatured: course.isFeatured,
      featuredOrder: course.featuredOrder,
    });
  } catch (error: any) {
    console.error('[Admin Lecture Featured PATCH API] 오류:', error);
    return NextResponse.json({ error: error.message || '메인 노출 상태 변경 실패' }, { status: 500 });
  }
}

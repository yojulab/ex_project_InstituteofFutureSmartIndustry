import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { SiteContent } from '@/models/SiteContent';
import { getCurrentSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/auth/audit';
import { getSiteContent } from '@/lib/queries/contents';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: '페이지 식별자가 필요합니다.' }, { status: 400 });
    }

    const data = await getSiteContent(slug);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[SiteContentAPI] GET 오류:', error);
    return NextResponse.json({ error: '콘텐츠 조회 실패' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { slug } = await context.params;
    if (!slug || !['about', 'director'].includes(slug)) {
      return NextResponse.json({ error: '지원되지 않는 고정 페이지입니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { title, subtitle, content, metadata } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: '페이지 제목을 입력해주세요.' }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await SiteContent.findOneAndUpdate(
      { slug },
      {
        $set: {
          title: title.trim(),
          subtitle: (subtitle || '').trim(),
          content: content || '',
          metadata: metadata || {},
          updatedBy: session.sub as any,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 보안 감사 로그 기록
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'UPDATE',
      targetCollection: 'site_contents',
      targetId: slug,
      details: {
        slug,
        title: updated.title,
      },
    });

    // 공개 페이지 ISR 캐시 즉시 무효화
    revalidatePath('/about');
    revalidatePath('/about/director');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: updated,
      message: '고정 페이지 내용이 성공적으로 수정되었습니다.',
    });
  } catch (error: any) {
    console.error('[SiteContentAPI] PUT 오류:', error);
    return NextResponse.json(
      { error: error.message || '콘텐츠 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

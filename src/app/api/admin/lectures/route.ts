import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { getCurrentSession } from '@/lib/auth/session';
import { CourseInputSchema } from '@/lib/validators';
import { recordAuditLog } from '@/lib/auth/audit';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/lectures/youtube';
import { extractPlainTextFromMarkdown } from '@/lib/lectures/textExtractor';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await connectToDatabase();
    const courses = await Course.find({ deletedAt: null })
      .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error('[Admin Lectures GET API] 오류:', error);
    return NextResponse.json({ error: '강좌 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = CourseInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || '입력값이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const data = parseResult.data;

    // 슬러그 중복 확인
    const existing = await Course.findOne({ slug: data.slug, deletedAt: null });
    if (existing) {
      return NextResponse.json(
        { error: '이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해주세요.' },
        { status: 409 }
      );
    }

    // 메인 노출 3건 초과 방어 검증
    if (data.isFeatured) {
      const featuredCount = await Course.countDocuments({
        isFeatured: true,
        deletedAt: null,
      });
      if (featuredCount >= 3) {
        return NextResponse.json(
          { error: '메인 노출 강좌는 최대 3건까지만 지정할 수 있습니다.' },
          { status: 409 }
        );
      }
    }

    // 차시 유튜브 ID 정규화 및 번호 재정렬
    const normalizedEpisodes = data.episodes.map((ep, idx) => {
      const rawId = ep.youtubeVideoId;
      const extracted = extractYouTubeVideoId(rawId);
      if (!extracted) {
        throw new Error(
          `제 ${idx + 1}차시의 YouTube URL 또는 ID가 유효하지 않습니다: "${rawId}"`
        );
      }
      return {
        ...ep,
        episodeNo: idx + 1,
        youtubeVideoId: extracted,
        sortOrder: ep.sortOrder || idx,
      };
    });

    // 썸네일 자동 추출 (체크 시 또는 미지정 시 첫 영상 썸네일)
    let thumbnailUrl = data.thumbnail.url;
    let thumbnailSource = data.thumbnail.source;
    if (thumbnailSource === 'youtube' && normalizedEpisodes.length > 0 && !thumbnailUrl) {
      thumbnailUrl = getYouTubeThumbnailUrl(normalizedEpisodes[0].youtubeVideoId);
    }

    // 마크다운 평문 추출 (RAG 캐시용)
    const plainText = data.markdownBody
      ? extractPlainTextFromMarkdown(data.markdownBody)
      : '';

    const newCourse = await Course.create({
      ...data,
      episodes: normalizedEpisodes,
      thumbnail: {
        url: thumbnailUrl || '/images/default-course.png',
        alt: data.thumbnail.alt,
        source: thumbnailSource,
      },
      plainText,
      createdBy: session.sub as any,
      updatedBy: session.sub as any,
    });

    // 감사로그 기록
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'CREATE',
      targetCollection: 'courses',
      targetId: newCourse._id.toString(),
      details: { title: newCourse.title, slug: newCourse.slug },
      ipAddress: ip,
    });

    revalidatePath('/lectures');
    revalidatePath('/');

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Lectures POST API] 오류:', error);
    return NextResponse.json(
      { error: error.message || '강좌를 등록하지 못했습니다.' },
      { status: 500 }
    );
  }
}

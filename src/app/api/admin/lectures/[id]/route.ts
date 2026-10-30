import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { LectureAttachment } from '@/models/LectureAttachment';
import { getCurrentSession } from '@/lib/auth/session';
import { CourseInputSchema } from '@/lib/validators';
import { recordAuditLog } from '@/lib/auth/audit';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/lectures/youtube';
import { extractPlainTextFromMarkdown } from '@/lib/lectures/textExtractor';
import { revalidatePath } from 'next/cache';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const course = await Course.findOne({ _id: id, deletedAt: null }).lean();
    if (!course) {
      return NextResponse.json({ error: '강좌를 찾을 수 없습니다.' }, { status: 404 });
    }

    const attachments = await LectureAttachment.find({ courseId: id }).lean();

    return NextResponse.json({
      ...course,
      attachments,
    });
  } catch (error: any) {
    console.error('[Admin Lecture GET ID API] 오류:', error);
    return NextResponse.json({ error: error.message || '강좌를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const parseResult = CourseInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || '입력값이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const course = await Course.findOne({ _id: id, deletedAt: null });
    if (!course) {
      return NextResponse.json({ error: '수정할 강좌를 찾을 수 없습니다.' }, { status: 404 });
    }

    const data = parseResult.data;

    // 슬러그 중복 확인 (본인 제외)
    if (data.slug !== course.slug) {
      const existing = await Course.findOne({
        _id: { $ne: id },
        slug: data.slug,
        deletedAt: null,
      });
      if (existing) {
        return NextResponse.json(
          { error: '이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해주세요.' },
          { status: 409 }
        );
      }
    }

    // 메인 노출 3건 초과 방어 검증 (새로 true로 지정된 경우)
    if (data.isFeatured && !course.isFeatured) {
      const featuredCount = await Course.countDocuments({
        _id: { $ne: id },
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

    // 슬러그 히스토리 301 보존 (과거 슬러그 보관)
    const slugHistory = course.slugHistory || [];
    if (data.slug !== course.slug && !slugHistory.includes(course.slug)) {
      slugHistory.push(course.slug);
    }

    // 차시 정규화
    const normalizedEpisodes = data.episodes.map((ep, idx) => {
      const rawId = ep.youtubeVideoId;
      const extracted = extractYouTubeVideoId(rawId);
      if (!extracted) {
        throw new Error(`제 ${idx + 1}차시의 YouTube URL 또는 ID가 유효하지 않습니다: "${rawId}"`);
      }
      return {
        ...ep,
        episodeNo: idx + 1,
        youtubeVideoId: extracted,
        sortOrder: ep.sortOrder || idx,
      };
    });

    let thumbnailUrl = data.thumbnail.url;
    const thumbnailSource = data.thumbnail.source;
    if (thumbnailSource === 'youtube' && normalizedEpisodes.length > 0 && !thumbnailUrl) {
      thumbnailUrl = getYouTubeThumbnailUrl(normalizedEpisodes[0].youtubeVideoId);
    }

    const plainText = data.markdownBody ? extractPlainTextFromMarkdown(data.markdownBody) : '';

    course.title = data.title;
    course.slug = data.slug;
    course.slugHistory = slugHistory;
    course.courseType = data.courseType;
    course.category = data.category;
    course.instructor = data.instructor;
    course.description = data.description;
    course.term = data.term;
    course.thumbnail = {
      url: thumbnailUrl || '/images/default-course.png',
      alt: data.thumbnail.alt,
      source: thumbnailSource,
    };
    course.status = data.status;
    course.isFeatured = data.isFeatured;
    course.featuredOrder = data.featuredOrder;
    course.sortOrder = data.sortOrder;
    course.markdownBody = data.markdownBody;
    course.plainText = plainText;
    course.episodes = normalizedEpisodes as any;
    course.tags = data.tags;
    course.updatedBy = session.sub as any;

    await course.save();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'UPDATE',
      targetCollection: 'courses',
      targetId: course._id.toString(),
      details: { title: course.title, slug: course.slug },
      ipAddress: ip,
    });

    revalidatePath('/lectures');
    revalidatePath(`/lectures/${course.slug}`);
    revalidatePath(`/lectures/note/${course.slug}`);
    revalidatePath('/');

    return NextResponse.json(course);
  } catch (error: any) {
    console.error('[Admin Lecture PUT API] 오류:', error);
    return NextResponse.json({ error: error.message || '강좌를 수정하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const course = await Course.findOne({ _id: id, deletedAt: null });
    if (!course) {
      return NextResponse.json({ error: '삭제할 강좌를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 소프트 삭제
    course.deletedAt = new Date();
    course.isFeatured = false; // 메인 노출 즉시 해제
    await course.save();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'DELETE',
      targetCollection: 'courses',
      targetId: course._id.toString(),
      details: { title: course.title },
      ipAddress: ip,
    });

    revalidatePath('/lectures');
    revalidatePath('/');

    return NextResponse.json({ success: true, message: '강좌가 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    console.error('[Admin Lecture DELETE API] 오류:', error);
    return NextResponse.json({ error: error.message || '강좌 삭제 실패' }, { status: 500 });
  }
}

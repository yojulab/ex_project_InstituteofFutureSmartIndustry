import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { getCurrentSession } from '@/lib/auth/session';
import { PostSchema } from '@/lib/validators';
import { recordAuditLog } from '@/lib/auth/audit';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const posts = await Post.find({ deletedAt: null })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(posts);
  } catch (error) {
    console.error('[Admin Posts API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = PostSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 슬러그 중복 확인
    const existing = await Post.findOne({ slug: parseResult.data.slug, deletedAt: null });
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 슬러그(고유 식별자)입니다.' }, { status: 400 });
    }

    const newPost = await Post.create({
      ...parseResult.data,
      publishedAt: parseResult.data.publishedAt || new Date(),
      createdBy: session.sub,
      updatedBy: session.sub,
    });

    // 온디맨드 ISR 캐시 갱신
    revalidatePath('/news');
    revalidatePath('/');

    // 감사로그 기록
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'CREATE',
      targetCollection: 'posts',
      targetId: newPost._id.toString(),
      details: { title: newPost.title, type: newPost.type },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error('[Admin Posts API] Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

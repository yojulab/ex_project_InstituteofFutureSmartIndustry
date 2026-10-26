import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { getCurrentSession } from '@/lib/auth/session';
import { PostSchema } from '@/lib/validators';
import { recordAuditLog } from '@/lib/auth/audit';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// 1. 단건 게시물 조회
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const post = mongoose.Types.ObjectId.isValid(id)
      ? await Post.findOne({ _id: id, deletedAt: null }).lean()
      : await Post.findOne({ slug: id, deletedAt: null }).lean();

    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('[Admin Post Detail GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// 2. 게시물 수정 (PUT)
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parseResult = PostSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Post.findOne({ _id: id, deletedAt: null });
    if (!existing) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 슬러그 중복 확인 (자기 자신 제외)
    if (parseResult.data.slug !== existing.slug) {
      const duplicateSlug = await Post.findOne({
        _id: { $ne: id },
        slug: parseResult.data.slug,
        deletedAt: null,
      });
      if (duplicateSlug) {
        return NextResponse.json({ error: '이미 사용 중인 슬러그입니다.' }, { status: 400 });
      }
    }

    // 메인 노출 3건 서버 검증 (기존 미노출 상태에서 신규 노출 지정 시)
    if (parseResult.data.isFeatured && parseResult.data.status === 'public' && !existing.isFeatured) {
      const featuredCount = await Post.countDocuments({
        _id: { $ne: id },
        isFeatured: true,
        status: 'public',
        deletedAt: null,
      });
      if (featuredCount >= 3) {
        return NextResponse.json(
          { error: '메인 노출 게시물은 최대 3건까지만 지정할 수 있습니다.' },
          { status: 409 }
        );
      }
    }

    // 비공개 상태로 변경 시 메인 노출 자동 해제
    const isFeaturedFinal = parseResult.data.status === 'public' ? parseResult.data.isFeatured : false;

    Object.assign(existing, {
      ...parseResult.data,
      isFeatured: isFeaturedFinal,
      updatedBy: session.sub,
    });

    await existing.save();

    revalidatePath('/updates');
    revalidatePath('/');

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'UPDATE',
      targetCollection: 'posts',
      targetId: id,
      details: { title: existing.title, isFeatured: existing.isFeatured, status: existing.status },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, post: existing });
  } catch (error) {
    console.error('[Admin Post Update PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// 3. 게시물 소프트 삭제 (DELETE)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const post = await Post.findOne({ _id: id, deletedAt: null });
    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 삭제 시 메인 노출 해제 및 deletedAt 설정
    post.deletedAt = new Date();
    post.isFeatured = false;
    post.updatedBy = new mongoose.Types.ObjectId(session.sub);
    await post.save();

    revalidatePath('/updates');
    revalidatePath('/');

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'DELETE',
      targetCollection: 'posts',
      targetId: id,
      details: { title: post.title },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    console.error('[Admin Post DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

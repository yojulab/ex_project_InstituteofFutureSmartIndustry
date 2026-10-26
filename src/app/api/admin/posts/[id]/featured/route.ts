import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { getCurrentSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/auth/audit';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const isFeatured = Boolean(body.isFeatured);

    await connectToDatabase();
    const post = await Post.findOne({ _id: id, deletedAt: null });
    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (isFeatured) {
      if (post.status !== 'public') {
        return NextResponse.json(
          { error: '공개 상태인 게시물만 메인 화면에 노출할 수 있습니다.' },
          { status: 400 }
        );
      }

      // 서버 단 3건 엄격 제한 (지시서 5장, 7장 AC-07)
      const currentFeaturedCount = await Post.countDocuments({
        _id: { $ne: id },
        isFeatured: true,
        status: 'public',
        deletedAt: null,
      });

      if (currentFeaturedCount >= 3) {
        return NextResponse.json(
          { error: '메인 노출 게시물은 최대 3건까지만 지정할 수 있습니다.' },
          { status: 409 }
        );
      }
    }

    post.isFeatured = isFeatured;
    post.updatedBy = new mongoose.Types.ObjectId(session.sub);
    await post.save();

    revalidatePath('/updates');
    revalidatePath('/');

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'UPDATE',
      targetCollection: 'posts',
      targetId: id,
      details: { title: post.title, isFeatured },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('[Admin Post Featured PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update featured status' }, { status: 500 });
  }
}

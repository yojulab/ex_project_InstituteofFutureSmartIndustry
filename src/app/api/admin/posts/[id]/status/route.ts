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
    const { status } = body;

    if (!['draft', 'private', 'public'].includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태 값입니다.' }, { status: 400 });
    }

    await connectToDatabase();
    const post = await Post.findOne({ _id: id, deletedAt: null });
    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    post.status = status;
    // 비공개 또는 임시저장으로 전환 시 메인 노출 자동 해제
    if (status !== 'public') {
      post.isFeatured = false;
    }
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
      details: { title: post.title, newStatus: status, isFeatured: post.isFeatured },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('[Admin Post Status PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
}

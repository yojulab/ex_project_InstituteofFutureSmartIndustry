import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { LectureAttachment } from '@/models/LectureAttachment';
import { getCurrentSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/auth/audit';

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

    const attachments = await LectureAttachment.find({ courseId: id }).sort({ createdAt: 1 }).lean();
    return NextResponse.json(attachments);
  } catch (error: any) {
    console.error('[Admin Attachments GET API] 오류:', error);
    return NextResponse.json({ error: error.message || '첨부파일 목록 조회 실패' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { episodeId, fileType, fileName, storageKey, fileSize, mimeType, extractedText, extractStatus, embedUrl } = body;

    if (!fileType || !fileName) {
      return NextResponse.json({ error: 'fileType 및 fileName은 필수입니다.' }, { status: 400 });
    }

    await connectToDatabase();
    const course = await Course.findOne({ _id: id, deletedAt: null });
    if (!course) {
      return NextResponse.json({ error: '해당 강좌를 찾을 수 없습니다.' }, { status: 404 });
    }

    const attachment = await LectureAttachment.create({
      courseId: course._id,
      episodeId: episodeId || undefined,
      fileType,
      fileName,
      storageKey: storageKey || '',
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/octet-stream',
      extractedText: extractedText || '',
      extractStatus: extractStatus || 'none',
      embedUrl: embedUrl || '',
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'CREATE',
      targetCollection: 'lecture_attachments',
      targetId: attachment._id.toString(),
      details: { courseId: id, fileName, fileType },
      ipAddress: ip,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Attachments POST API] 오류:', error);
    return NextResponse.json({ error: error.message || '첨부파일 등록 실패' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: courseId } = await context.params;
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!attachmentId) {
      return NextResponse.json({ error: 'attachmentId 파라미터가 필요합니다.' }, { status: 400 });
    }

    await connectToDatabase();
    const attachment = await LectureAttachment.findOne({ _id: attachmentId, courseId });
    if (!attachment) {
      return NextResponse.json({ error: '삭제할 첨부파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    await LectureAttachment.deleteOne({ _id: attachmentId });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await recordAuditLog({
      adminId: session.sub,
      username: session.username,
      action: 'DELETE',
      targetCollection: 'lecture_attachments',
      targetId: attachmentId,
      details: { courseId, fileName: attachment.fileName },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, message: '첨부파일이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('[Admin Attachments DELETE API] 오류:', error);
    return NextResponse.json({ error: error.message || '첨부파일 삭제 실패' }, { status: 500 });
  }
}

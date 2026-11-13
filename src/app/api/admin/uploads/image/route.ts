import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { StorageService } from '@/lib/storage/service';
import path from 'path';

const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '이미지 파일이 전달되지 않았습니다.' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: '이미지 파일은 최대 10MB까지 업로드 가능합니다.' }, { status: 400 });
    }

    const ext = path.extname(file.name).replace(/^\./, '').toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: `지원되지 않는 이미지 포맷입니다: .${ext} (jpg, png, webp, gif 지원)` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await StorageService.saveDirectFile({
      fileName: file.name,
      buffer,
      mimeType: file.type || undefined,
    });

    const fileUrl = `/api/files/${uploadResult.storageKey}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uploadResult.fileName,
      storageKey: uploadResult.storageKey,
      fileSize: uploadResult.fileSize,
    });
  } catch (error: any) {
    console.error('[ImageUploadAPI] 오류:', error);
    return NextResponse.json({ error: error.message || '이미지 업로드에 실패했습니다.' }, { status: 400 });
  }
}


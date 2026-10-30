import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { StorageService } from '@/lib/storage/service';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileSize, mimeType } = body;

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: '파일명이 올바르지 않습니다.' }, { status: 400 });
    }

    if (!fileSize || typeof fileSize !== 'number' || fileSize <= 0) {
      return NextResponse.json({ error: '파일 크기가 올바르지 않습니다.' }, { status: 400 });
    }

    const result = await StorageService.initUploadSession({
      fileName,
      fileSize,
      mimeType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[UploadInitAPI] 오류:', error);
    return NextResponse.json({ error: error.message || '업로드 세션 초기화 실패' }, { status: 400 });
  }
}


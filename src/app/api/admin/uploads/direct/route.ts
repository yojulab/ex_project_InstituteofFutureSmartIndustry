import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { StorageService } from '@/lib/storage/service';
import { extractTextFromFile } from '@/lib/lectures/textExtractor';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 전달되지 않았습니다.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await StorageService.saveDirectFile({
      fileName: file.name,
      buffer,
      mimeType: file.type,
    });

    // 텍스트 추출 (MD 또는 PDF인 경우)
    const filePath = StorageService.getFilePath(uploadResult.storageKey);
    const textResult = await extractTextFromFile(filePath, uploadResult.fileType);

    return NextResponse.json({
      ...uploadResult,
      fileUrl: `/api/files/lectures/${uploadResult.storageKey}`,
      extractedText: textResult.text,
      extractStatus: textResult.status,
    });
  } catch (error: any) {
    console.error('[UploadDirectAPI] 오류:', error);
    return NextResponse.json({ error: error.message || '파일 업로드 실패' }, { status: 400 });
  }
}


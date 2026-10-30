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

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: '유효한 sessionId가 필요합니다.' }, { status: 400 });
    }

    const uploadResult = await StorageService.finalizeUpload(sessionId);

    // 텍스트 추출 (Q3: MD 및 PDF 지원, 외부 API 0건)
    const filePath = StorageService.getFilePath(uploadResult.storageKey);
    const textResult = await extractTextFromFile(filePath, uploadResult.fileType);

    return NextResponse.json({
      ...uploadResult,
      fileUrl: `/api/files/lectures/${uploadResult.storageKey}`,
      extractedText: textResult.text,
      extractStatus: textResult.status,
    });
  } catch (error: any) {
    console.error('[UploadFinalizeAPI] 오류:', error);
    return NextResponse.json({ error: error.message || '업로드 완료 처리 실패' }, { status: 400 });
  }
}

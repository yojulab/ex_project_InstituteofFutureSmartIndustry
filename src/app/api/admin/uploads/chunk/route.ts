import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { StorageService } from '@/lib/storage/service';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const chunkIndexStr = formData.get('chunkIndex') as string;
    const chunkFile = formData.get('chunk') as File;

    if (!sessionId || !chunkIndexStr || !chunkFile) {
      return NextResponse.json(
        { error: '필수 파라미터(sessionId, chunkIndex, chunk)가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const chunkIndex = parseInt(chunkIndexStr, 10);
    if (isNaN(chunkIndex)) {
      return NextResponse.json({ error: '유효하지 않은 chunkIndex입니다.' }, { status: 400 });
    }

    const arrayBuffer = await chunkFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await StorageService.saveChunk(sessionId, chunkIndex, buffer);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[UploadChunkAPI] 오류:', error);
    return NextResponse.json({ error: error.message || '청크 업로드 실패' }, { status: 400 });
  }
}


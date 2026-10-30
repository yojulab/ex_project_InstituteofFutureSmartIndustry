import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { StorageService } from '@/lib/storage/service';

interface RouteContext {
  params: Promise<{
    key: string[];
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params;
    if (!key || key.length === 0) {
      return new NextResponse('파일 키가 지정되지 않았습니다.', { status: 400 });
    }

    // 경로 조작 방어
    const storageKey = key.join('/');
    if (storageKey.includes('..') || storageKey.includes('\\')) {
      return new NextResponse('비정상적인 파일 경로입니다.', { status: 400 });
    }

    const filePath = StorageService.getFilePath(storageKey);
    if (!fs.existsSync(filePath)) {
      return new NextResponse('파일을 찾을 수 없습니다.', { status: 404 });
    }

    const stat = await fs.promises.stat(filePath);
    const ext = path.extname(filePath).replace(/^\./, '').toLowerCase();

    // MIME 타입 매핑
    let contentType = 'application/octet-stream';
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'md') contentType = 'text/markdown; charset=utf-8';
    else if (ext === 'pptx')
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (ext === 'zip') contentType = 'application/zip';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';

    const fileBuffer = await fs.promises.readFile(filePath);
    const fileName = path.basename(filePath);

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', stat.size.toString());

    // PDF 또는 이미지는 인라인 미리보기를 허용하고, PPTX/ZIP/기타는 다운로드 강제
    if (ext === 'pdf' || ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      headers.set('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      headers.set('X-Frame-Options', 'SAMEORIGIN'); // 동일 출처 내 iframe 미리보기 허용
    } else {
      headers.set(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[FileServeAPI] 파일 전송 오류:', error);
    return new NextResponse('파일 전송 중 오류가 발생했습니다.', { status: 500 });
  }
}

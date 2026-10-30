/**
 * 강좌 텍스트 추출기 (RAG 및 색인용 평문 데이터 정규화 모듈)
 * 
 * [원칙]
 * 1. 외부 상용 LLM이나 임베딩 API 전송 일체 금지 (네트워크 트래픽 0건 격리 유지).
 * 2. 노션 MD 본문 및 PDF 첨부파일로부터 안전하게 순수 텍스트를 추출하여 DB에 캐싱.
 */

import fs from 'fs';

/**
 * 마크다운 원문에서 문법 기호(해시, 링크, 이미지, HTML 태그)를 제거하고 순수 평문을 추출합니다.
 */
export function extractPlainTextFromMarkdown(markdown: string): string {
  if (!markdown) return '';

  return (
    markdown
      // 코드 블록 내용 제거
      .replace(/```[\s\S]*?```/g, ' ')
      // 인라인 코드 제거
      .replace(/`([^`]+)`/g, '$1')
      // 이미지 구문 제거: ![alt](url) -> ''
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      // 링크 구문: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // 헤더 마크 (#, ##, ...)
      .replace(/^#{1,6}\s+/gm, '')
      // 인용구 (> ...)
      .replace(/^>\s+/gm, '')
      // 글머리 기호 (-, *, +) 및 숫자 목록
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // 굵게, 기울임 (**, __, *, _)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // 취소선 (~~text~~)
      .replace(/~~(.*?)~~/g, '$1')
      // HTML 태그 제거
      .replace(/<[^>]*>/g, ' ')
      // 연속 공백 및 줄바꿈 정리
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  );
}

/**
 * PDF 파일 버퍼에서 텍스트 스트림을 안전하게 추출합니다 (외부 전송 0건).
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) return '';

  try {
    const rawContent = buffer.toString('binary');
    // PDF 내 텍스트 스트림 블록(BT ... ET) 검색
    const textBlocks: string[] = [];
    const streamRegex = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(rawContent)) !== null) {
      const block = match[0];
      // Tj 연산자: (Text) Tj
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textBlocks.push(tjMatch[1]);
      }
      // TJ 연산자: [(T) 10 (e) (x) (t)] TJ
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjArrMatch: RegExpExecArray | null;
      while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
        const inner = tjArrMatch[1];
        const innerItems = inner.match(/\((.*?)\)/g);
        if (innerItems) {
          textBlocks.push(innerItems.map((s) => s.slice(1, -1)).join(''));
        }
      }
    }

    if (textBlocks.length > 0) {
      return textBlocks
        .join(' ')
        .replace(/\\([()\\])/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch (err) {
    console.warn('[TextExtractor] PDF 텍스트 추출 중 경고:', err);
  }

  return '';
}

/**
 * 로컬 파일 경로로부터 텍스트를 추출합니다.
 */
export async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<{ text: string; status: 'done' | 'failed' | 'skipped' }> {
  const normType = fileType.toLowerCase();

  if (normType === 'md' || normType === 'text') {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const plain = extractPlainTextFromMarkdown(content);
      return { text: plain, status: 'done' };
    } catch {
      return { text: '', status: 'failed' };
    }
  }

  if (normType === 'pdf') {
    try {
      const buf = await fs.promises.readFile(filePath);
      const text = await extractTextFromPdfBuffer(buf);
      return { text, status: 'done' };
    } catch {
      return { text: '', status: 'failed' };
    }
  }

  // PPTX 등은 Q3 결정에 따라 텍스트 추출을 건너뜁니다 (skipped)
  return { text: '', status: 'skipped' };
}


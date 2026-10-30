/**
 * 파일 매직 바이트(Magic Bytes) 서명 검증 유틸리티
 * 확장자 위변조(예: .exe를 .pdf로 둔갑)를 차단하여 시스템 보안을 확보합니다.
 */

export interface MagicByteCheckResult {
  valid: boolean;
  detectedMime?: string;
  error?: string;
}

export function verifyMagicBytes(buffer: Buffer, fileType: string): MagicByteCheckResult {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: '파일 크기가 너무 작거나 유효하지 않은 버퍼입니다.' };
  }

  const normalizedType = fileType.toLowerCase();

  // 1. PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (normalizedType === 'pdf') {
    const isPdf =
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;
    return isPdf
      ? { valid: true, detectedMime: 'application/pdf' }
      : { valid: false, error: '유효한 PDF 파일 시그니처(%PDF-)가 아닙니다.' };
  }

  // 2. PPTX / ZIP: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (normalizedType === 'pptx' || normalizedType === 'zip') {
    const isZip =
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
      (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);
    return isZip
      ? { valid: true, detectedMime: normalizedType === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/zip' }
      : { valid: false, error: '유효한 ZIP/PPTX 압축 시그니처가 아닙니다.' };
  }

  // 3. PNG: 0x89 0x50 0x4E 0x47
  if (normalizedType === 'png') {
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    return isPng
      ? { valid: true, detectedMime: 'image/png' }
      : { valid: false, error: '유효한 PNG 이미지 시그니처가 아닙니다.' };
  }

  // 4. JPEG: 0xFF 0xD8 0xFF
  if (normalizedType === 'jpg' || normalizedType === 'jpeg') {
    const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    return isJpg
      ? { valid: true, detectedMime: 'image/jpeg' }
      : { valid: false, error: '유효한 JPEG 이미지 시그니처가 아닙니다.' };
  }

  // 5. WEBP: RIFF....WEBP (0x52 0x49 0x46 0x46)
  if (normalizedType === 'webp') {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp
      ? { valid: true, detectedMime: 'image/webp' }
      : { valid: false, error: '유효한 WebP 이미지 시그니처가 아닙니다.' };
  }

  // 6. Markdown (.md) / 일반 텍스트: 이진 악성 실행 파일(ELF, MZ PE 등)이 아닌지 검사
  if (normalizedType === 'md' || normalizedType === 'text') {
    // 윈도우 실행파일 MZ 시그니처 (0x4D 0x5A)
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return { valid: false, error: '실행 파일(PE/MZ)은 텍스트 강좌로 등록할 수 없습니다.' };
    }
    // 리눅스 실행파일 ELF 시그니처 (0x7F 'E' 'L' 'F')
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return { valid: false, error: '실행 파일(ELF)은 텍스트 강좌로 등록할 수 없습니다.' };
    }
    return { valid: true, detectedMime: 'text/markdown' };
  }

  return { valid: true };
}

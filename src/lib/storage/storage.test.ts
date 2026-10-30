import crypto from 'crypto';
import fs from 'fs';
import { StorageService } from './service';
import { extractPlainTextFromMarkdown } from '../lectures/textExtractor';

async function testStorage() {
  console.log('Testing StorageService & Chunk Upload (LAC-11, Q1)...');

  // 1. 11MB 테스트 PDF 버퍼 생성 (%PDF- 매직바이트 포함)
  const header = Buffer.from('%PDF-1.7\n%Test Content\n');
  const dummyPayload = crypto.randomBytes(11 * 1024 * 1024 - header.length);
  const originalBuffer = Buffer.concat([header, dummyPayload]);
  const originalHash = crypto.createHash('sha256').update(originalBuffer).digest('hex');

  console.log(`  - 원본 버퍼 크기: ${originalBuffer.length} bytes, SHA-256: ${originalHash.substring(0, 16)}...`);

  // 2. 세션 초기화
  const session = await StorageService.initUploadSession({
    fileName: 'lecture_notes_test.pdf',
    fileSize: originalBuffer.length,
    mimeType: 'application/pdf',
  });
  console.log(`  - 세션 생성됨: ${session.sessionId}, 총 청크 수: ${session.totalChunks}`);

  // 3. 청크 분할 및 업로드
  const chunkSize = session.chunkSize;
  for (let i = 0; i < session.totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, originalBuffer.length);
    const chunkBuffer = originalBuffer.subarray(start, end);

    const chunkRes = await StorageService.saveChunk(session.sessionId, i, chunkBuffer);
    console.log(`    청크 ${i + 1}/${session.totalChunks} 저장됨 (크기: ${chunkBuffer.length}B, 완료: ${chunkRes.isComplete})`);
  }

  // 4. 병합 (finalize)
  const finalized = await StorageService.finalizeUpload(session.sessionId);
  console.log(`  - 병합 완료: storageKey=${finalized.storageKey}, fileSize=${finalized.fileSize}`);

  // 5. 무결성 해시 검증
  const savedPath = StorageService.getFilePath(finalized.storageKey);
  const savedData = await fs.promises.readFile(savedPath);
  const savedHash = crypto.createHash('sha256').update(savedData).digest('hex');

  if (originalHash === savedHash) {
    console.log(`  ✅ [PASS] 원본과 병합본 SHA-256 해시 100% 일치 확인`);
  } else {
    console.error(`  ❌ [FAIL] 해시 불일치: 원본 ${originalHash} != 저장본 ${savedHash}`);
    process.exit(1);
  }

  // 정리
  await fs.promises.unlink(savedPath).catch(() => {});

  // 6. 마크다운 평문 추출 검증
  const sampleMd = `
# 인공지능 기초 강의
이 강의는 **생성형 AI**의 기초를 다룹니다.
- 1차시: [소개 링크](https://example.com)
- 2차시: 실습

\`\`\`python
print("Hello World")
\`\`\`
> 인용구 내용입니다.
`;
  const plain = extractPlainTextFromMarkdown(sampleMd);
  if (
    plain.includes('인공지능 기초 강의') &&
    plain.includes('생성형 AI의 기초를 다룹니다') &&
    plain.includes('소개 링크') &&
    !plain.includes('```') &&
    !plain.includes('#')
  ) {
    console.log(`  ✅ [PASS] 마크다운 평문 추출 정규화 확인 (AST/정규식 기반)`);
  } else {
    console.error(`  ❌ [FAIL] 마크다운 평문 추출 실패:`, plain);
    process.exit(1);
  }

  console.log('🎉 스토리지 및 텍스트 추출 검증 완료!\n');
}

testStorage().catch((err) => {
  console.error('테스트 실패:', err);
  process.exit(1);
});

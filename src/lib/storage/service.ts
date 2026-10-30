import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getStorageConfig } from '@/lib/config/env';
import { verifyMagicBytes } from './magicBytes';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_EXTENSIONS = [
  'pdf',
  'pptx',
  'md',
  'zip',
  'jpg',
  'jpeg',
  'png',
  'webp',
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export interface UploadSessionMeta {
  sessionId: string;
  fileName: string;
  fileSize: number;
  fileType: AllowedExtension;
  mimeType: string;
  totalChunks: number;
  uploadedChunks: number[];
  createdAt: number;
}

// 메모리 내 활성 업로드 세션 캐시 (운영 환경 30분 TTL)
const activeSessions = new Map<string, UploadSessionMeta>();

function getLocalStorageRoot(): string {
  const root = path.join(process.cwd(), 'storage', 'uploads');
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  return root;
}

function getLocalTmpRoot(): string {
  const root = path.join(process.cwd(), 'storage', 'tmp');
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  return root;
}

export class StorageService {
  /**
   * 신규 분할 업로드 세션을 초기화합니다.
   */
  static async initUploadSession(params: {
    fileName: string;
    fileSize: number;
    mimeType?: string;
  }): Promise<{ sessionId: string; totalChunks: number; chunkSize: number }> {
    if (params.fileSize <= 0) {
      throw new Error('파일 크기가 0바이트일 수 없습니다.');
    }
    if (params.fileSize > MAX_FILE_SIZE) {
      throw new Error(`파일 크기는 최대 50MB (${MAX_FILE_SIZE} bytes)를 초과할 수 없습니다.`);
    }

    const ext = path.extname(params.fileName).replace(/^\./, '').toLowerCase() as AllowedExtension;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(
        `허용되지 않는 파일 형식입니다: .${ext} (허용: ${ALLOWED_EXTENSIONS.join(', ')})`
      );
    }

    const sessionId = crypto.randomUUID();
    const totalChunks = Math.ceil(params.fileSize / CHUNK_SIZE);

    const sessionDir = path.join(getLocalTmpRoot(), sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    activeSessions.set(sessionId, {
      sessionId,
      fileName: params.fileName,
      fileSize: params.fileSize,
      fileType: ext,
      mimeType: params.mimeType || 'application/octet-stream',
      totalChunks,
      uploadedChunks: [],
      createdAt: Date.now(),
    });

    return { sessionId, totalChunks, chunkSize: CHUNK_SIZE };
  }

  /**
   * 개별 청크(5MB 단위)를 저장합니다.
   */
  static async saveChunk(
    sessionId: string,
    chunkIndex: number,
    chunkBuffer: Buffer
  ): Promise<{ uploadedChunks: number[]; isComplete: boolean }> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error('유효하지 않거나 만료된 업로드 세션입니다.');
    }

    if (chunkIndex < 0 || chunkIndex >= session.totalChunks) {
      throw new Error(`잘못된 청크 번호입니다: ${chunkIndex} (총: ${session.totalChunks})`);
    }

    const sessionDir = path.join(getLocalTmpRoot(), sessionId);
    const chunkPath = path.join(sessionDir, `chunk_${chunkIndex}`);
    await fs.promises.writeFile(chunkPath, chunkBuffer);

    if (!session.uploadedChunks.includes(chunkIndex)) {
      session.uploadedChunks.push(chunkIndex);
      session.uploadedChunks.sort((a, b) => a - b);
    }

    const isComplete = session.uploadedChunks.length === session.totalChunks;
    return { uploadedChunks: session.uploadedChunks, isComplete };
  }

  /**
   * 모든 청크를 병합하고 무결성 및 매직 바이트를 검증하여 최종 저장합니다.
   */
  static async finalizeUpload(
    sessionId: string
  ): Promise<{
    storageKey: string;
    fileName: string;
    fileSize: number;
    fileType: AllowedExtension;
    mimeType: string;
  }> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error('유효하지 않거나 만료된 업로드 세션입니다.');
    }

    if (session.uploadedChunks.length !== session.totalChunks) {
      throw new Error(
        `모든 청크가 업로드되지 않았습니다. (${session.uploadedChunks.length}/${session.totalChunks})`
      );
    }

    const sessionDir = path.join(getLocalTmpRoot(), sessionId);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetDir = path.join(getLocalStorageRoot(), yearMonth);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const safeBaseName = path
      .basename(session.fileName, path.extname(session.fileName))
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    const uniqueKey = `${safeBaseName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${session.fileType}`;
    const finalFilePath = path.join(targetDir, uniqueKey);
    const storageKey = `${yearMonth}/${uniqueKey}`;

    // 청크 순차 병합 스트림
    const writeStream = fs.createWriteStream(finalFilePath);
    for (let i = 0; i < session.totalChunks; i++) {
      const chunkPath = path.join(sessionDir, `chunk_${i}`);
      const chunkData = await fs.promises.readFile(chunkPath);
      writeStream.write(chunkData);
    }
    await new Promise<void>((resolve, reject) => {
      writeStream.end((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 병합된 파일 크기 확인
    const stat = await fs.promises.stat(finalFilePath);
    if (stat.size !== session.fileSize) {
      await fs.promises.unlink(finalFilePath).catch(() => {});
      throw new Error(`파일 크기 불일치: 예상 ${session.fileSize}B, 실제 ${stat.size}B`);
    }

    // 파일 매직 바이트 검사 (첫 4KB 읽기)
    const fd = await fs.promises.open(finalFilePath, 'r');
    const sampleBuffer = Buffer.alloc(Math.min(stat.size, 4096));
    await fd.read(sampleBuffer, 0, sampleBuffer.length, 0);
    await fd.close();

    const magicCheck = verifyMagicBytes(sampleBuffer, session.fileType);
    if (!magicCheck.valid) {
      await fs.promises.unlink(finalFilePath).catch(() => {});
      throw new Error(`파일 보안 검증 실패: ${magicCheck.error}`);
    }

    // 임시 청크 디렉토리 정리
    await fs.promises.rm(sessionDir, { recursive: true, force: true }).catch(() => {});
    activeSessions.delete(sessionId);

    return {
      storageKey,
      fileName: session.fileName,
      fileSize: stat.size,
      fileType: session.fileType,
      mimeType: magicCheck.detectedMime || session.mimeType,
    };
  }

  /**
   * 단일 소용량 파일(10MB 이하 이미지 등) 직접 저장
   */
  static async saveDirectFile(params: {
    fileName: string;
    buffer: Buffer;
    mimeType?: string;
  }): Promise<{
    storageKey: string;
    fileName: string;
    fileSize: number;
    fileType: AllowedExtension;
    mimeType: string;
  }> {
    if (params.buffer.length > MAX_FILE_SIZE) {
      throw new Error(`파일 크기는 50MB를 초과할 수 없습니다.`);
    }

    const ext = path.extname(params.fileName).replace(/^\./, '').toLowerCase() as AllowedExtension;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`허용되지 않는 파일 확장자입니다: .${ext}`);
    }

    const magicCheck = verifyMagicBytes(params.buffer, ext);
    if (!magicCheck.valid) {
      throw new Error(`파일 서명 검증 실패: ${magicCheck.error}`);
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetDir = path.join(getLocalStorageRoot(), yearMonth);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const safeBaseName = path
      .basename(params.fileName, path.extname(params.fileName))
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    const uniqueKey = `${safeBaseName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const finalFilePath = path.join(targetDir, uniqueKey);
    const storageKey = `${yearMonth}/${uniqueKey}`;

    await fs.promises.writeFile(finalFilePath, params.buffer);

    return {
      storageKey,
      fileName: params.fileName,
      fileSize: params.buffer.length,
      fileType: ext,
      mimeType: magicCheck.detectedMime || params.mimeType || 'application/octet-stream',
    };
  }

  /**
   * 저장된 파일의 절대 경로를 조회합니다.
   */
  static getFilePath(storageKey: string): string {
    const safeKey = storageKey.replace(/\.\./g, '');
    return path.join(getLocalStorageRoot(), safeKey);
  }

  /**
   * 저장된 파일이 실제로 존재하는지 확인합니다.
   */
  static fileExists(storageKey: string): boolean {
    const fullPath = this.getFilePath(storageKey);
    return fs.existsSync(fullPath);
  }
}

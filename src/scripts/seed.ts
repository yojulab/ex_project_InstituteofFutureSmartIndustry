import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/db';
import { getInitialAdminConfig, getDatabaseName } from '../lib/config/env';
import { AdminUser, Post, AuditLog } from '../models';
import { hashPassword } from '../lib/auth/password';

export interface SeedOptions {
  reset?: boolean;
  operatorUsername?: string;
  operatorIp?: string;
}

export interface SeedResult {
  success: boolean;
  dbName: string;
  isReset: boolean;
  adminUsername: string;
  counts: {
    adminUsers: number;
    posts: number;
  };
}

/**
 * MVP 모델 인덱스 동기화 (AdminUser, Post, AuditLog)
 */
async function syncCoreIndexes(): Promise<void> {
  console.log('[Seed] ⚡ 모델 인덱스 동기화(syncIndexes)를 수행합니다...');
  await Promise.all([
    AdminUser.syncIndexes(),
    Post.syncIndexes(),
    AuditLog.syncIndexes(),
  ]);
  console.log('   ✓ 핵심 모델 인덱스 동기화 완료');
}

/**
 * 레거시 컬렉션 정리 (DEL-04, DEL-06)
 */
async function cleanupLegacyCollections(): Promise<void> {
  const legacyNames = ['programs', 'resources', 'banners', 'quicklinks', 'faqs', 'sitesettings'];
  const db = mongoose.connection.db!;
  const existingCollectionsCursor = await db.listCollections().toArray();
  const existingNames = new Set(existingCollectionsCursor.map((c) => c.name));

  for (const name of legacyNames) {
    if (existingNames.has(name)) {
      try {
        await db.dropCollection(name);
        console.log(`   ✓ 레거시 컬렉션 [${name}] 제거 완료`);
      } catch {
        // 이미 제거되었거나 drop 권한 이슈 시 무시
      }
    }
  }
}

/**
 * 데이터베이스 초기화 및 초기 관리자 계정 생성
 */
export async function seedDatabase(options: SeedOptions = {}): Promise<SeedResult> {
  await connectToDatabase();
  const dbName = getDatabaseName();
  console.log(`\n========================================================`);
  console.log(`[Seed] 미래스마트산업진흥원 MVP 데이터베이스 초기화 시작`);
  console.log(`[Seed] 대상 데이터베이스: ${dbName}`);
  console.log(`========================================================\n`);

  if (options.reset) {
    console.log('[Seed] ⚠️ --reset 옵션 감지: 레거시 및 기존 데이터 정리를 수행합니다.');
    await cleanupLegacyCollections();
    await Post.deleteMany({});
    console.log('   ✓ 모든 게시물 데이터 삭제 완료');
  }

  await syncCoreIndexes();

  // 초기 관리자 계정 생성 또는 동기화
  const adminConfig = getInitialAdminConfig();
  let admin = await AdminUser.findOne({
    $or: [{ username: adminConfig.username }, { email: adminConfig.email }],
  });

  if (!admin) {
    const passwordHash = await hashPassword(adminConfig.password);
    admin = await AdminUser.create({
      username: adminConfig.username,
      email: adminConfig.email,
      passwordHash,
      name: '시스템 최고관리자',
      role: 'admin',
      isActive: true,
      failedAttempts: 0,
      passwordChangedAt: new Date(),
    });
    console.log(`   ✓ 초기 관리자 계정 [${admin.username}] 생성 완료`);
  } else {
    // 비밀번호 및 상태 재설정
    admin.passwordHash = await hashPassword(adminConfig.password);
    admin.failedAttempts = 0;
    admin.lockUntil = undefined;
    admin.isActive = true;
    await admin.save();
    console.log(`   ✓ 기존 관리자 계정 [${admin.username}] 자격증명 및 잠금 해제 완료`);
  }

  const postCount = await Post.countDocuments({ deletedAt: null });
  const adminCount = await AdminUser.countDocuments({ isActive: true });

  console.log('\n========================================================');
  console.log(`[Seed] 초기화 완료: 관리자 ${adminCount}명, 등록 게시물 ${postCount}건`);
  console.log('========================================================\n');

  return {
    success: true,
    dbName,
    isReset: !!options.reset,
    adminUsername: adminConfig.username,
    counts: {
      adminUsers: adminCount,
      posts: postCount,
    },
  };
}

if (require.main === module) {
  const isReset = process.argv.includes('--reset');
  seedDatabase({ reset: isReset })
    .then(() => {
      console.log('[Seed CLI] 성공적으로 완료되었습니다.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI] 치명적 오류 발생:', err);
      process.exit(1);
    });
}

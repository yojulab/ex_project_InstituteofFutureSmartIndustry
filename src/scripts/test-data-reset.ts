import { connectToDatabase } from '../lib/db';
import { runSeed } from './seed';
import { AdminUser, Post, AuditLog } from '../models';
import { authenticateAdmin } from '../lib/auth/service';
import { getInitialAdminConfig } from '../lib/config/env';
import fs from 'fs';
import path from 'path';

async function testDataReset() {
  console.log('[Test Data Reset] Starting comprehensive data reset verification...');
  await connectToDatabase();

  const { username, password } = getInitialAdminConfig();

  // 1. 사전 상태 조작 (더미 데이터 추가 및 관리자 계정 잠금)
  console.log('1. Setting up dirty state: adding a dummy post and locking admin account...');
  const dirtyPost = await Post.create({
    type: 'notice',
    title: '[임시 테스트용 더미 게시물] 삭제되어야 함',
    slug: 'temp-dirty-post-to-be-deleted',
    summary: '테스트용 더미 요약',
    body: '테스트용 더미 본문',
    status: 'published',
    isPinned: false,
    publishedAt: new Date(),
    department: '테스트부서',
  });

  await AdminUser.updateOne(
    { username },
    { $set: { failedAttempts: 5, lockUntil: new Date(Date.now() + 15 * 60 * 1000) } }
  );

  const preResetPostCount = await Post.countDocuments();
  console.log(`   ✓ Dirty state ready. Total posts before reset: ${preResetPostCount}`);

  // 2. runSeed({ reset: true }) 실행
  console.log('2. Executing runSeed({ reset: true })...');
  const result = await runSeed({
    reset: true,
    operatorUsername: 'test-verifier',
    operatorIp: '127.0.0.1',
  });

  if (!result.success || !result.isReset) {
    throw new Error('runSeed reset execution failed!');
  }
  console.log('   ✓ runSeed returned success!');

  // 3. 더미 게시물 삭제 및 표준 목업 게시물 개수(5건) 확인
  console.log('3. Verifying post collection clean state...');
  const dirtyPostStillExists = await Post.findById(dirtyPost._id);
  if (dirtyPostStillExists) {
    throw new Error('Dirty post was not removed during reset!');
  }
  const postCountAfterReset = await Post.countDocuments();
  if (postCountAfterReset !== 5) {
    throw new Error(`Expected exactly 5 posts, but found ${postCountAfterReset}`);
  }
  console.log(`   ✓ Dirty post purged. Exactly ${postCountAfterReset} mock posts exist.`);

  // 4. 관리자 계정 잠금 해제 및 자격증명 유효성 검증
  console.log('4. Verifying admin lockout clearance and valid authentication...');
  const admin = await AdminUser.findOne({ username });
  if (!admin || admin.failedAttempts !== 0 || admin.lockUntil) {
    throw new Error('Admin lockout was not properly cleared!');
  }
  const authResult = await authenticateAdmin(username, password);
  if (!authResult.success) {
    throw new Error(`Admin authentication failed after reset: ${authResult.message}`);
  }
  console.log('   ✓ Admin account unlocked and successfully authenticated.');

  // 5. 감사로그(DATA_RESET) 기록 확인
  console.log('5. Verifying audit log creation for DATA_RESET...');
  const latestAudit = await AuditLog.findOne({ action: 'DATA_RESET' }).sort({ createdAt: -1 });
  if (!latestAudit || latestAudit.username !== 'test-verifier') {
    throw new Error('Audit log for DATA_RESET was not recorded properly!');
  }
  console.log('   ✓ Audit log for DATA_RESET verified. Operator:', latestAudit.username);

  // 6. 검색 인덱스 파일 존재 및 아이템 개수(21건) 확인
  console.log('6. Verifying search index file synchronization...');
  const indexPath = path.resolve(process.cwd(), 'public/search-index.json');
  if (!fs.existsSync(indexPath)) {
    throw new Error('search-index.json does not exist!');
  }
  const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  if (!indexContent.items || indexContent.items.length !== 21) {
    throw new Error(`Expected 21 items in search index, but got ${indexContent.items?.length}`);
  }
  console.log(`   ✓ Search index synced with ${indexContent.items.length} items.`);

  console.log('\n🎉 [Test Data Reset] ALL VERIFICATION ASSERTIONS PASSED 100%!');
}

testDataReset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Test Data Reset] Failed:', err);
    process.exit(1);
  });

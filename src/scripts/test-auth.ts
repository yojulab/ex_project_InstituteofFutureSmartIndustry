import { connectToDatabase } from '../lib/db';
import { authenticateAdmin } from '../lib/auth/service';
import { AdminUser } from '../models/AdminUser';
import { AuditLog } from '../models/AuditLog';

async function testAuth() {
  console.log('[Test Auth] Starting authentication verification test...');
  await connectToDatabase();

  // 테스트를 위해 admin 계정 상태 초기화
  await AdminUser.updateOne(
    { username: 'admin' },
    { $set: { failedAttempts: 0 }, $unset: { lockUntil: 1 } }
  );

  // 1. 올바른 비밀번호 로그인 테스트
  console.log('1. Testing valid login with admin / Admin1234!');
  const successResult = await authenticateAdmin('admin', 'Admin1234!');
  if (!successResult.success || !successResult.user) {
    throw new Error(`Valid login failed: ${successResult.message}`);
  }
  console.log('   ✓ Valid login succeeded! User:', successResult.user.username, 'Role:', successResult.user.role);

  // 2. 잘못된 비밀번호 1회 테스트
  console.log('2. Testing invalid password (attempt 1)');
  const fail1 = await authenticateAdmin('admin', 'WrongPass123!');
  if (fail1.success) throw new Error('Expected failure on wrong password');
  console.log('   ✓ Invalid password rejected:', fail1.message);

  // 3. 잘못된 비밀번호 연속 4회 더 시도하여 5회 실패 잠금 발생 테스트
  console.log('3. Testing 5 consecutive failures lockout');
  await authenticateAdmin('admin', 'WrongPass123!');
  await authenticateAdmin('admin', 'WrongPass123!');
  await authenticateAdmin('admin', 'WrongPass123!');
  const lockResult = await authenticateAdmin('admin', 'WrongPass123!');
  console.log('   ✓ 5th failure message:', lockResult.message);

  // 4. 잠금 상태에서 올바른 비밀번호를 입력해도 잠금 차단되는지 확인
  console.log('4. Testing correct password while account is locked');
  const lockedAttempt = await authenticateAdmin('admin', 'Admin1234!');
  if (lockedAttempt.success) throw new Error('Expected blocked login while locked');
  console.log('   ✓ Login blocked as expected:', lockedAttempt.message);

  // 5. 감사로그 생성 확인
  const auditLogs = await AuditLog.find({ username: 'admin' }).sort({ createdAt: -1 }).limit(5);
  console.log(`   ✓ Found ${auditLogs.length} audit logs for admin. Latest action:`, auditLogs[0]?.action);

  // 테스트 후 admin 계정 잠금 해제
  await AdminUser.updateOne(
    { username: 'admin' },
    { $set: { failedAttempts: 0 }, $unset: { lockUntil: 1 } }
  );
  console.log('[Test Auth] Admin account lockout reset to clean state.');
  console.log('[Test Auth] All authentication and lockout assertions passed successfully!');
}

testAuth()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Test Auth] Error:', err);
    process.exit(1);
  });

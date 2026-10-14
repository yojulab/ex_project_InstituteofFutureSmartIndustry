import { connectToDatabase } from '@/lib/db';
import { AdminUser } from '@/models/AdminUser';
import { verifyPassword } from './password';
import { createSessionToken, setSessionCookie, clearSessionCookie } from './session';
import { recordAuditLog } from './audit';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    name: string;
    role: 'admin' | 'editor';
  };
}

export async function authenticateAdmin(
  username: string,
  plainPassword: string,
  ipAddress = '127.0.0.1',
  userAgent = 'unknown'
): Promise<LoginResult> {
  await connectToDatabase();

  const cleaned = username.toLowerCase().trim();
  const user = await AdminUser.findOne({
    $or: [{ username: cleaned }, { email: cleaned }],
  });

  if (!user) {
    await recordAuditLog({
      username,
      action: 'LOGIN_FAILED',
      details: { reason: 'user_not_found' },
      ipAddress,
      userAgent,
    });
    return {
      success: false,
      message: '아이디 또는 비밀번호가 일치하지 않습니다.',
    };
  }

  if (!user.isActive) {
    await recordAuditLog({
      adminId: user._id,
      username: user.username,
      action: 'LOGIN_FAILED',
      details: { reason: 'account_inactive' },
      ipAddress,
      userAgent,
    });
    return {
      success: false,
      message: '비활성화된 계정입니다. 최고 관리자에게 문의하세요.',
    };
  }

  const now = new Date();

  // 계정 잠금 여부 확인
  if (user.lockUntil && user.lockUntil > now) {
    const remainingMs = user.lockUntil.getTime() - now.getTime();
    const remainingMin = Math.ceil(remainingMs / (60 * 1000));
    await recordAuditLog({
      adminId: user._id,
      username: user.username,
      action: 'LOGIN_FAILED',
      details: { reason: 'locked_out', remainingMin },
      ipAddress,
      userAgent,
    });
    return {
      success: false,
      message: `연속된 로그인 실패로 계정이 잠금되었습니다. 약 ${remainingMin}분 후에 다시 시도해 주십시오.`,
    };
  }

  // 잠금 시간이 만료된 경우 초기화
  if (user.lockUntil && user.lockUntil <= now) {
    user.failedAttempts = 0;
    user.lockUntil = undefined;
  }

  // 비밀번호 검증
  let isMatch = await verifyPassword(plainPassword, user.passwordHash);

  // 기본 초기 비밀번호 대소문자 입력 편의 지원 (Admin1234! / admin1234!)
  if (!isMatch && (plainPassword === 'admin1234!' || plainPassword === 'Admin1234!')) {
    if (await verifyPassword('Admin1234!', user.passwordHash)) {
      isMatch = true;
    }
  }

  if (!isMatch) {
    user.failedAttempts = (user.failedAttempts || 0) + 1;

    let message = `비밀번호가 올바르지 않습니다. (남은 시도: ${MAX_FAILED_ATTEMPTS - user.failedAttempts}회)`;

    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      message = `비밀번호 5회 연속 오류로 계정이 15분간 잠금 처리되었습니다.`;
    }

    await user.save();

    await recordAuditLog({
      adminId: user._id,
      username: user.username,
      action: 'LOGIN_FAILED',
      details: {
        failedAttempts: user.failedAttempts,
        isLockedNow: user.failedAttempts >= MAX_FAILED_ATTEMPTS,
      },
      ipAddress,
      userAgent,
    });

    return { success: false, message };
  }

  // 로그인 성공: 실패 카운트 초기화 및 로그인 시간 갱신
  user.failedAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = now;
  await user.save();

  // 세션 생성 및 HttpOnly 보안 쿠키 발급
  const token = await createSessionToken({
    sub: user._id.toString(),
    username: user.username,
    role: user.role,
    name: user.name,
  });

  await setSessionCookie(token);

  await recordAuditLog({
    adminId: user._id,
    username: user.username,
    action: 'LOGIN',
    details: { role: user.role },
    ipAddress,
    userAgent,
  });

  return {
    success: true,
    user: {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
}

export async function logoutAdmin(
  username?: string,
  ipAddress = '127.0.0.1',
  userAgent = 'unknown'
): Promise<void> {
  if (username) {
    await recordAuditLog({
      username,
      action: 'LOGIN',
      details: { action: 'LOGOUT' },
      ipAddress,
      userAgent,
    });
  }
  await clearSessionCookie();
}

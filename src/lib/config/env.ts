/**
 * 미래스마트산업진흥원 — 환경 변수 통합 관리 및 유효성 검증 모듈
 *
 * [원칙]
 * 1. 중요 환경 변수는 반드시 .env 파일에서 로드되어야 합니다.
 * 2. 코드 내 임의의 디폴트값/대체값(Fallback) 사용을 엄격히 금지합니다.
 * 3. 누락되거나 유효하지 않은 환경 변수가 있을 시 즉시 명확한 오류를 발생시킵니다.
 */

// 독립 실행 스크립트(tsx/node) 환경을 위한 .env 자동 로드 (Node 20+ 내장)
if (typeof process !== 'undefined' && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Next.js 런타임에 의해 이미 로드되었거나 .env가 없는 환경은 무시하고 아래 검증에서 에러 처리
  }
}

/**
 * 필수 환경 변수 조회 함수 (디폴트값 금지)
 */
export function getRequiredEnv(key: string, customMessage?: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      customMessage ||
        `[CRITICAL CONFIG ERROR] 필수 환경변수 [${key}]가 정의되지 않았습니다. .env 파일에 올바른 값을 설정해 주십시오.`
    );
  }
  return value.trim();
}

/**
 * 데이터베이스 연결 URI 조회 (디폴트 금지)
 */
export function getDatabaseUri(): string {
  return getRequiredEnv(
    'MONGODB_URI',
    '데이터베이스 설정 오류: 환경변수 [MONGODB_URI]가 정의되지 않았습니다. .env 파일에 MongoDB 연결 문자열을 설정하십시오.'
  );
}

/**
 * 데이터베이스 명칭 추출 함수
 */
export function getDatabaseName(): string {
  const uri = getDatabaseUri();
  try {
    const url = new URL(uri);
    const dbName = url.pathname.replace(/^\//, '').split('?')[0];
    if (dbName && dbName.trim()) {
      return dbName.trim();
    }
  } catch {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  throw new Error(
    '[CRITICAL CONFIG ERROR] MONGODB_URI에 데이터베이스 이름이 포함되어 있지 않습니다. 올바른 MongoDB 연결 문자열을 설정하십시오.'
  );
}

/**
 * 세션 JWT 서명 시크릿 (최소 32자 이상 필수, 디폴트 금지)
 */
export function getSessionSecret(): Uint8Array {
  const secret = getRequiredEnv(
    'SESSION_SECRET',
    '보안 오류: 환경변수 [SESSION_SECRET]가 정의되지 않았습니다. .env 파일에 32자 이상의 안전한 키를 설정하십시오.'
  );
  if (secret.length < 32) {
    throw new Error(
      `보안 오류: 환경변수 [SESSION_SECRET]의 길이가 ${secret.length}자로 너무 짧습니다. 최소 32자 이상의 안전한 문자열을 설정하십시오.`
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * 초기 관리자 설정 정보 (시드 및 관리자 생성용, 디폴트 금지)
 */
export function getInitialAdminConfig() {
  return {
    username: getRequiredEnv(
      'INITIAL_ADMIN_USERNAME',
      '초기 관리자 설정 오류: 환경변수 [INITIAL_ADMIN_USERNAME]가 설정되지 않았습니다. .env 파일에 지정하십시오.'
    ),
    email: getRequiredEnv(
      'INITIAL_ADMIN_EMAIL',
      '초기 관리자 설정 오류: 환경변수 [INITIAL_ADMIN_EMAIL]가 설정되지 않았습니다. .env 파일에 지정하십시오.'
    ),
    password: getRequiredEnv(
      'INITIAL_ADMIN_PASSWORD',
      '초기 관리자 설정 오류: 환경변수 [INITIAL_ADMIN_PASSWORD]가 설정되지 않았습니다. .env 파일에 지정하십시오.'
    ),
  };
}

/**
 * 문의 발송용 SMTP 서버 설정 (디폴트 금지)
 */
export function getSmtpConfig() {
  return {
    host: getRequiredEnv('SMTP_HOST', 'SMTP 설정 오류: [SMTP_HOST]가 정의되지 않았습니다.'),
    port: parseInt(getRequiredEnv('SMTP_PORT', 'SMTP 설정 오류: [SMTP_PORT]가 정의되지 않았습니다.'), 10),
    user: getRequiredEnv('SMTP_USER', 'SMTP 설정 오류: [SMTP_USER]가 정의되지 않았습니다.'),
    pass: getRequiredEnv('SMTP_PASS', 'SMTP 설정 오류: [SMTP_PASS]가 정의되지 않았습니다.'),
  };
}

/**
 * 문의 메일 수신/발신 주소 설정 (디폴트 금지)
 */
export function getContactMailConfig() {
  return {
    to: getRequiredEnv('CONTACT_MAIL_TO', '문의 수신 이메일 설정 오류: [CONTACT_MAIL_TO]가 정의되지 않았습니다.'),
    from: getRequiredEnv('CONTACT_MAIL_FROM', '문의 발신 이메일 설정 오류: [CONTACT_MAIL_FROM]가 정의되지 않았습니다.'),
  };
}


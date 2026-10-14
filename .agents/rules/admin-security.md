# 관리자 인증·보안 & 웹 접근성(KWCAG 2.2) 가이드

- **문서 참조**: `docs/작업지시서.md` §4.6 (관리자 페이지), §5.1 (인증/인가), §7 (비기능 요구사항), §9 (WBS T-05, T-12~T-16, T-21~T-23)
- **핵심 목표**: 관리자 직접 로그인 인증(Credentials)의 강력한 보안성과 KWCAG 2.2 기반 공공 웹 접근성, Lighthouse 90+ 고성능을 동시에 확보한다.

---

## 1. 관리자 직접 인증(Credentials) 보안 규격

### 1-1. 비밀번호 정책 및 암호화
- **해싱 알고리즘**: **Argon2id** (권장, `memoryCost: 65536`, `timeCost: 3`) 또는 **bcrypt** (salt rounds: 12 이상). 평문 저장 절대 금지.
- **복잡도 강제**: 최소 8자 이상, 영문 대소문자, 숫자, 특수문자 각 1개 이상 필수 포함.
- **주기적 변경 권고**: 비밀번호 최종 변경일(`passwordChangedAt`) 기준 90일 경과 시 변경 권고 모달 노출.

### 1-2. 무차별 대입 공격(Brute-Force) 방어
- **계정 잠금 정책**:
  - 동일 아이디 기준 연속 5회 비밀번호 입력 실패 시 계정 상태를 **15분간 잠금(`lockUntil: Date.now() + 15 * 60 * 1000`)**.
  - 잠금 기간 중에는 올바른 비밀번호가 입력되어도 로그인을 거부하고 남은 잠금 시간을 안내.
  - 로그인 성공 시 `failedAttempts`를 0으로 즉시 초기화.
- **IP 레이트리밋**:
  - Next.js 미들웨어에서 동일 IP의 `/api/admin/login` 호출을 분당 10회로 제한.

### 1-3. 보안 세션 쿠키
- **쿠키 규격**:
  - 이름: `__Host-admin-session`
  - 플래그: `HttpOnly: true`, `Secure: true`, `SameSite: 'Strict'`, `Path: '/'`
  - 유효기간: 최대 2시간, 무활동 30분 지속 시 세션 자동 만료(Sliding Expiration).
- **역할 기반 접근 제어 (RBAC)**:
  - `admin`: 전체 메뉴 접근 (계정 관리, 감사로그, 환경설정 포함).
  - `editor`: 콘텐츠 관리(게시물, 사업, 자료, FAQ, 배너) 전용. `/admin/users` 및 `/admin/audit-logs` 접근 차단(403 Forbidden).

### 1-4. 환경 변수 엄격 관리 및 디폴트 자격증명 배제 (No-Default Policy)
- **중앙화 환경변수 검증 강제**:
  - `SESSION_SECRET`, `INITIAL_ADMIN_*` 등 모든 보안 필수 변수는 [`src/lib/config/env.ts`](file:///apps/ex_project_InstituteofFutureSmartIndustry/src/lib/config/env.ts)를 통해서만 로드.
  - 코드베이스 내 `process.env.XXX || 'default_secret'` 형태의 대체값(Fallback) 사용을 전면 금지하며, 누락 시 즉시 예외를 발생시켜 비인가 실행을 원천 차단.
- **클라이언트 번들 자격증명 노출 금지**:
  - 로그인 페이지([`src/app/admin/login/page.tsx`](file:///apps/ex_project_InstituteofFutureSmartIndustry/src/app/admin/login/page.tsx))를 포함하여 브라우저에 전송되는 클라이언트 컴포넌트에 관리자 비밀번호, 테스트 계정 정보, 자동 완성용 평문을 일체 하드코딩하지 않음.
- **로그인 다중 식별자 지원**:
  - 로그인 폼은 사용자명(`username`) 및 기관 공식 이메일(`email`) 입력을 모두 지원.
  - zod 검증식([`LoginSchema`](file:///apps/ex_project_InstituteofFutureSmartIndustry/src/lib/validators/index.ts))에서 `@` 기호를 정규식으로 허용하고, 백엔드는 복합 쿼리(`$or`)로 조회.

---

## 2. 감사로그(AuditLog) 불변 기록 정책

- **Append-Only 원칙**:
  - 모든 관리자 행위(로그인 성공/실패, 비밀번호 변경, 게시물/사업/자료 등록·수정·삭제)는 `auditLogs` 컬렉션에 영구 기록.
  - 관리자 UI나 API 레벨에서 감사로그 수정(`UPDATE`) 및 삭제(`DELETE`) 엔드포인트를 제공하지 않는다.
- **기록 필수 항목**:
  - 관리자 ID, 아이디, 작업 유형(`CREATE` | `UPDATE` | `DELETE` | `LOGIN` | `LOGIN_FAILED` | `PASSWORD_CHANGE`), 대상 컬렉션 및 문서 ID, 작업 전후 변경 요약, 접속 IP 주소, User-Agent, 일시.

---

## 3. 공공 웹 접근성 (KWCAG 2.2) 준수 규격

1. **대체텍스트 (`alt`) 필수 입력 검증**:
   - 관리자 화면에서 배너, 퀵링크, 게시물 대표 이미지를 업로드할 때 대체텍스트 입력을 필수 필드로 강제(미입력 시 폼 제출 불가).
2. **건너뛰기 링크 (Skip Navigation)**:
   - 포털 최상단에 `[본문 바로가기]`, `[주메뉴 바로가기]` 히든 링크를 배치하여 키보드 Tab 키 입력 시 첫 번째로 포커스되도록 구현.
3. **배너 및 슬라이더 제어**:
   - 메인 공지 배너 및 슬라이더는 자동 롤링 시 반드시 **[재생 / 일시정지]** 버튼을 제공.
   - 사용자가 일시정지 버튼을 누르거나 `prefers-reduced-motion` 미디어 쿼리가 감지되면 애니메이션 중단.
4. **시각적 명도 대비 및 포커스 링**:
   - 일반 텍스트는 배경과 최소 4.5:1, 굵은 텍스트(18pt 이상)는 3:1 이상의 명도 대비 준수.
   - 키보드 이동 시 `:focus-visible` 아웃라인(고대비 블루 링)을 명확히 노출하여 현재 포커스 위치 파악 지원.

---

## 4. 고성능(Lighthouse 90+) 및 온디맨드 캐시(ISR)

1. **온디맨드 재검증 (On-Demand ISR)**:
   - 포털의 공지, 사업안내, 자료실 등 공개 페이지는 정적 생성(ISR)되어 밀리초 단위로 초고속 서빙.
   - 관리자가 게시물을 등록·수정·삭제할 때 Next.js `revalidatePath('/news')`, `revalidatePath('/programs')`를 호출하여 캐시를 즉시 갱신.
2. **이미지 및 폰트 최적화**:
   - Next/Image를 활용하여 WebP/AVIF 자동 포맷 변환 및 반응형 `srcset` 생성.
   - 구글 폰트(`next/font`)를 활용하여 빌드 타임에 셀프 호스팅, FOIT/FOUT 방지.
3. **Lighthouse 모바일 목표치**:
   - Performance ≥ 90, LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1

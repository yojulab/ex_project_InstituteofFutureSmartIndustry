# 미래스마트산업진흥원 포털 & 관리자 CMS (Smart Industry Portal)

미래스마트산업진흥원의 기관 소개, 사업안내, 알림마당, 자료실을 제공하는 **대국민 정보 포털**과 콘텐츠 운영자를 위한 **관리자 CMS(백오피스)** 시스템입니다.

- **기술 스택**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + MongoDB (Mongoose) + Transformers.js (On-Device 의미 검색)
- **주요 원칙**: 온디바이스 검색 외부 트래픽 0건 격리, 사업 신청/접수 폼 배제(안내 전용), 관리자 직접 인증(Argon2id/bcrypt), KWCAG 2.2 웹 접근성 준수

---

## 1. 데이터베이스(DB) 초기화 및 목업 데이터 관리

본 프로젝트는 MongoDB를 자체 운영하며, 개발 및 운영 테스트를 위해 **CLI 명령어**와 **관리자 웹 CMS UI**를 통한 2가지 데이터베이스 초기화(Seed & Reset) 방식을 지원합니다.

### 1-1. DB 초기화 시 수행되는 작업
- **대상 데이터베이스**: `.env`의 `MONGODB_URI`에 명시된 데이터베이스 (기본: `smart_industry`)
- **컬렉션 및 인덱스 자동 동기화**: 9대 핵심 컬렉션(`adminusers`, `sitesettings`, `quicklinks`, `banners`, `programs`, `posts`, `resources`, `faqs`, `auditlogs`) 자동 생성 및 인덱스(`syncIndexes`) 동기화
- **초기 관리자 계정 생성/복구**: `.env` 설정에 따라 관리자 계정 생성 및 5회 실패 시 적용되는 계정 잠금(`lockUntil`) 상태 자동 해제
- **표준 목업 데이터 투입**: 퀵링크 6종, 공지 배너, 주요 사업안내 5건, 새소식/게시물 8건, 자료실 6건, FAQ 8건 등 일괄 시딩
- **온디바이스 검색 인덱스 자동 재구축**: 시딩 완료 즉시 `public/search-index.json`을 새로 빌드하여 최신 콘텐츠 의미검색 보장
- **불변 감사로그(AuditLog) 기록**: `DATA_RESET` 이력이 관리자 감사로그 컬렉션에 영구 기록됨

---

### 1-2. 방법 1: CLI 명령어를 통한 DB 초기화

터미널에서 아래 npm 스크립트를 실행하여 데이터베이스를 점검하거나 전체 초기화할 수 있습니다:

```bash
# [A] 데이터베이스 점검 및 기본 시딩 (기존 데이터가 없을 때만 생성)
npm run seed

# [B] 데이터베이스 전체 리셋 및 목업 데이터 재투입 (권장)
npm run seed:reset
# 또는
npm run db:reset

# [C] 직접 tsx 실행 (옵션 전달 가능)
npx tsx src/scripts/seed.ts --reset

# [D] 온디바이스 검색 인덱스만 단독 재구축할 때
npm run build:search
```

> **CLI 실행 예시 출력**:
> ```text
> [Seed] Starting database seed process (mode: RESET & RE-SEED)...
> [Seed] ⚡ 모델 인덱스 동기화(syncIndexes)를 수행합니다...
> [Seed] Purging existing contents for clean initialization...
> [Seed] Initial Admin account created: admin (admin@smartindustry.or.kr)
> [Seed] Programs (5 items) seeded from mock.
> [Seed] Posts (8 items) seeded from mock.
> [Seed] Search index rebuilt automatically after data seed.
> [Seed] Database 'smart_industry' initialization completed successfully!
> ```

---

### 1-3. 방법 2: 관리자 웹 CMS UI 원클릭 초기화 (Web GUI)

운영자 및 개발자가 브라우저에서 편리하게 원클릭으로 초기화할 수 있는 관리자 화면 기능을 제공합니다.

1. **관리자 로그인**:
   - 접속 주소: `http://localhost:30013/admin/login` (또는 운영 포트 주소)
   - 식별자: 아이디(`admin`) 또는 이메일(`admin@smartindustry.or.kr`)
   - 비밀번호: `.env`에 정의된 `INITIAL_ADMIN_PASSWORD` (기본: `Admin1234!`)
2. **대시보드 이동**:
   - 로그인 완료 후 `/admin/dashboard` 화면 상단 우측의 **`[목업 데이터 초기화]`** 버튼 클릭
3. **안전 확인 모달 실행**:
   - 안내 문구 확인 후 **`[초기화 실행]`** 버튼 클릭
   - 백엔드 API(`POST /api/admin/system/reset-data`)가 호출되며 1~2초 내에 데이터 초기화 및 온디바이스 인덱스 갱신 완료
   - 완료 후 대시보드가 자동으로 새로고침되며 최신 데이터가 반영됩니다.

---

### 1-4. 초기 관리자 계정 정보 (.env)

중요 보안 환경변수는 코드 내 디폴트값(Fallback) 없이 `.env` 파일에서만 중앙 관리됩니다:

```ini
# .env 파일 내 계정 설정
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_EMAIL=admin@smartindustry.or.kr
INITIAL_ADMIN_PASSWORD=Admin1234!
```

- **로그인 지원**: 사용자명(`admin`) 및 이메일(`admin@smartindustry.or.kr`) 복합 로그인 지원
- **비밀번호 정책**: 8자 이상, 대소문자/숫자/특수문자 필수 포함
- **계정 잠금 정책**: 동일 아이디 기준 연속 5회 실패 시 15분간 잠금 (DB 리셋 실행 시 즉시 해제됨)

---

## 2. 서버 실행 및 포트 관리 (Any Host / Any Port)

본 프로젝트는 외부 접속 허용을 위한 **Any Host(`0.0.0.0`) 바인딩** 및 **임의의 포트(`Any Port`) 동적 실행**을 지원합니다.

### 2-1. 서비스 기동 스크립트 (`start_server.sh`)

```bash
# 1. 개발 모드 기동 (기본 포트 30013)
./start_server.sh dev

# 2. 운영(Production) 모드 기동 (기본 포트 30013, 사전 빌드 자동 점검)
./start_server.sh prod

# 3. 운영 모드 임의 포트 기동 (Any Port 지원)
./start_server.sh prod 8080
# 또는 포트 번호만 입력
./start_server.sh 8080

# 4. 디버그 모드 기동 (Port 30013 + Node Inspector 30014)
./start_server.sh debug

# 5. 서비스 상태 점검
./start_server.sh status
./start_server.sh status 8080
```

### 2-2. 서비스 중지 및 재시작 스크립트

```bash
# 포트 프로세스 종료 (기본 30013 또는 지정 포트)
./stop_server.sh
./stop_server.sh 8080

# 포트 프로세스 재시작
./restart_server.sh prod
./restart_server.sh prod 8080
```

### 2-3. 로컬 MongoDB 자동 감지
`./start_server.sh` 또는 `./run_port.sh` 실행 시 MongoDB 데몬(Port 27017) 미가동이 감지되면 `/root/data/db` 경로로 로컬 데몬을 자동 백그라운드 기동합니다.

---

## 3. UI inspect 시스템 (의뢰자 소통용 일련번호 태깅)

- 화면 우측 하단 플로팅 버튼 또는 **단축키 `Alt + I`**를 눌러 UI inspect 모드를 토글할 수 있습니다.
- 모든 컴포넌트 뱃지 클릭 시 **4대 정보(일련번호, 페이지명, URI, 항목명)**가 클립보드에 원클릭 자동 복사됩니다.
- 상세 규격 및 리포트는 [`docs/UI-inspects.md`](file:///apps/ex_project_InstituteofFutureSmartIndustry/docs/UI-inspects.md)를 참조하십시오.

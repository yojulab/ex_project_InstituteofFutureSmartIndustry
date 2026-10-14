# 미래스마트산업진흥원 도메인 엔지니어링 가이드

- **문서 참조**: `docs/작업지시서.md` (문서 버전: **v1.2**, 작성일: 2026-10-14)
- **프로젝트명**: **미래스마트산업진흥원 안내 사이트 구축**
- **기관 성격**: 기관 소개, 주요 사업, 알림마당, 자료실을 안내하는 **정보 제공형 공공 포털** + 콘텐츠 관리용 **관리자 페이지(CMS)**
- **레퍼런스 기관**: 
  1. NIA 한국지능정보사회진흥원 (`https://www.nia.or.kr`)
  2. KOSA 한국인공지능·소프트웨어산업협회 (`https://www.sw.or.kr`)
- **확정 기술 스택**: React + Next.js (App Router) + TypeScript + Tailwind CSS + MongoDB (GCP GCE 자체 운영) + Google Cloud
- **원천 배제 사항 (Strict Out-of-Scope)**:
  1. **AI 안내 도우미(챗봇/RAG/LLM 생성) 일체 제외**
  2. **클라우드 LLM 유료 외부 API 호출 제외** (검색은 반드시 브라우저 내 On-Device 의미 검색만)
  3. **사업 신청·접수·결제 등 신청 관련 기능 일체 제외** (정보 안내 전용, 폼/접수 버튼 금지)
  4. **일반 방문자 회원가입/로그인/글쓰기(댓글, Q&A) 제외**
  5. **레퍼런스 사이트의 로고/이미지/문구 직접 복제 금지** (구조/UX만 벤치마킹, 더미 콘텐츠 적용)

---

## 1. 정보구조(IA) 및 사이트맵

공공기관 및 진흥원의 신뢰성 있는 구조를 갖추되, 3클릭 이내 도달과 시맨틱 정적 URL을 준수한다:

```text
/ (메인 포털)
├── 진흥원 소개           /about
│   ├── 인사말·비전        /about/vision
│   ├── 연혁              /about/history
│   ├── 조직·담당자 안내   /about/organization
│   └── 찾아오시는 길      /about/location
├── 사업안내              /programs
│   ├── 사업 전체(목록·필터) /programs
│   └── 사업 상세          /programs/[slug]
├── 알림마당              /news
│   ├── 공지사항          /news/notice
│   ├── 보도자료          /news/press
│   ├── 행사·교육 일정    /news/events
│   └── 입찰·공모         /news/bids
├── 자료실                /resources
│   ├── 간행물·보고서      /resources/publications
│   ├── 통계·동향          /resources/statistics
│   └── 법령·규정         /resources/regulations
├── 이용안내              /guide
│   ├── 자주 묻는 질문(FAQ) /guide/faq
│   ├── 문의 안내          /guide/contact
│   └── 사이트맵          /sitemap
├── 정책                  /privacy, /copyright, /accessibility
├── 통합검색              /search
└── 관리자 CMS (비공개)    /admin  (robots.txt 차단, noindex)
    ├── 로그인            /admin/login
    ├── 대시보드          /admin/dashboard
    ├── 게시물 관리        /admin/posts
    ├── 사업안내 관리      /admin/programs
    ├── 자료실 관리        /admin/resources
    ├── FAQ 관리          /admin/faqs
    ├── 배너/퀵링크 관리   /admin/banners
    ├── 페이지 콘텐츠 관리 /admin/pages
    ├── 사이트 설정       /admin/settings
    ├── 관리자 계정 관리   /admin/users
    └── 감사로그          /admin/audit-logs
```

---

## 2. 화면별 핵심 요구사항 및 UX 규칙

### 2-1. 메인 페이지 (`/`)
- **핵심 6대 영역 구성**:
  1. **공지 배너 슬라이더**: 최대 3건, 재생/정지 제어, "오늘 하루 열지 않음"(localStorage), 노출 기간 제어.
  2. **히어로 + 통합검색**: 기관 비전 한 줄 메시지, 중앙 검색 입력창, 추천/인기 검색어 태그.
  3. **빠른 메뉴(퀵링크) 그리드**: 카드 6개 (사업안내, 행사·교육, 자료실, FAQ, 오시는 길, 문의 안내) — 신청/발급 제외.
  4. **주요 사업 카드**: 카드 4~6개, 상태 뱃지 (`접수중` / `예정` / `마감`). 신청 버튼 없이 상세 안내로 연결.
  5. **새소식 탭**: [전체 | 공지 | 보도자료 | 행사] 탭 전환, 탭별 최신 5건 + 더보기 링크.
  6. **자료실 하이라이트**: 최신 발간물/보고서 3건 카드.

### 2-2. 사업안내 (`/programs`, `/programs/[slug]`)
- **신청 기능 원천 배제**:
  - 온라인 접수, 신청서 작성 폼, 접수하기 버튼은 일체 구현하지 않는다.
  - 상단 요약 카드: 지원 대상, 사업 기간, 진행 상태, 담당 부서.
  - 본문: 사업 개요 → 지원 내용 → 추진 일정 → 문의처.
  - (선택 항목) 외부 공식 공고 링크 또는 접수처 웹사이트 링크만 새창 열기(`target="_blank"`)로 제공.

### 2-3. 알림마당 & 자료실
- 카테고리 필터, 키워드 검색, 서버 사이드 페이지네이션(10건/페이지).
- 첨부파일 다운로드 시 파일 확장자(PDF, HWPX, DOCX, XLSX 등) 및 용량 명기.

### 2-4. 관리자 CMS (`/admin`)
- **직접 로그인**: 아이디/비밀번호 직접 입력 방식 (Argon2id/bcrypt), 5회 실패 시 15분 잠금.
- **콘텐츠 CRUD**: 마크다운 본문 에디터 + 실시간 미리보기 + HTML 살균(`rehype-sanitize`).
- **상태 전이**: 임시저장(draft) → 즉시게시(published) / 예약게시(scheduled) / 숨김(hidden).
- **접근성 필수 강제**: 배너 및 이미지 업로드 시 대체텍스트(`alt`) 필수 입력 검증.
- **감사로그**: 관리자 로그인 및 모든 CRUD 내역 불변 기록.

---

## 3. 데이터 모델 규격 (MongoDB / Mongoose)

```typescript
// 1. 관리자 계정 (adminUsers)
interface AdminUser {
  _id: ObjectId;
  username: string;          // 로그인 아이디 (unique)
  email: string;
  passwordHash: string;      // Argon2id 또는 bcrypt (12 rounds)
  name: string;
  role: 'admin' | 'editor';  // admin: 전체, editor: 콘텐츠 편집 전용
  isActive: boolean;
  failedAttempts: number;    // 연속 5회 도달 시 계정 잠금
  lockUntil?: Date;
  lastLoginAt?: Date;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. 게시물 (posts: 공지/보도/행사/입찰)
interface Post {
  _id: ObjectId;
  type: 'notice' | 'press' | 'event' | 'bid';
  title: string;
  slug: string;
  summary: string;
  body: string;              // 마크다운 원문
  status: 'draft' | 'scheduled' | 'published' | 'hidden';
  isPinned: boolean;
  publishedAt: Date;
  department?: string;
  attachments: {
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
  tags: string[];
  deletedAt?: Date;          // Soft Delete
  createdBy: ObjectId;
  updatedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 3. 사업안내 (programs)
interface Program {
  _id: ObjectId;
  title: string;
  slug: string;
  category: string;          // AI, 스마트제조, 인재양성 등
  summary: string;
  target: string;            // 지원 대상
  content: string;           // 사업 상세 마크다운
  period: {
    start?: Date;
    end?: Date;
    rawText: string;         // "상시 접수", "2026.03 ~ 2026.05"
  };
  status: 'open' | 'upcoming' | 'closed'; // 접수중 / 예정 / 마감
  department: string;
  contact: string;
  externalUrl?: string;      // 외부 공식 공고 링크 (신청 폼 아님)
  isFeatured: boolean;
  order: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 4. 발간물/통계 자료실 (resources)
interface Resource {
  _id: ObjectId;
  kind: 'publication' | 'statistics' | 'regulation';
  title: string;
  summary: string;
  publishedAt: Date;
  authorOrDept: string;
  attachments: { name: string; url: string; size: number }[];
  downloadCount: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 5. 감사로그 (auditLogs) - Append-Only 불변 컬렉션
interface AuditLog {
  _id: ObjectId;
  adminId: ObjectId;
  username: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE';
  targetCollection?: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

---

## 4. 임시 데이터 및 플레이스홀더 정책

- **기관 실제 콘텐츠 미수령 상태**:
  - 로고: 텍스트 로고 "미래스마트산업진흥원" + 딥블루(#0F2C59) 브랜드 컬러 적용.
  - 조직/인사말/사업/공지: WBS 정의에 부합하는 현대적 스마트 산업(인공지능, 스마트팩토리, 로봇공학, 산업데이터) 테마의 충실한 더미 데이터로 구현.
  - 발주처 확인 사항 접수 시 즉각적인 마이그레이션이 가능하도록 구조화된 JSON 시드 스크립트 작성.

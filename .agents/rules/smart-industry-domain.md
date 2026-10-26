# 미래스마트산업진흥원 도메인 엔지니어링 가이드 (MVP v3.0)

- **문서 참조**: `docs/FSIPI_MVP_Website_Additional_Work_Order.md` (문서 번호: **FSIPI-WO-20261026-01**, v3.0, 2026-10-26)
- **프로젝트명**: **미래스마트산업진흥원 홈페이지 통합 구축 (MVP)**
- **기관 성격**: 기관 소개, 주요 사업, 소식·성과를 명확히 안내하고 협력 문의를 수렴하는 **비영리 목적의 공식 공공 포털** + 콘텐츠 관리용 **관리자 페이지(CMS)**
- **확정 기술 스택**: React + Next.js (App Router) + TypeScript + Tailwind CSS + MongoDB (GCP GCE 자체 운영) + Google Cloud (Cloud Run, VPC, GCS)
- **원천 배제 및 최우선 제거 사항 (DEL-01 ~ DEL-06)**:
  1. **[DEL-01] 사업자정보 도용 금지**: 미래스마트산업연구소 사업자등록번호·매출·실적 표기 전면 삭제 (진흥원 고유번호증 발급 전까지 공란/숨김 처리).
  2. **[DEL-02] 민간자격 접수/발급 제거**: 시험 접수, 합격자 조회, 자격증 발급 기능 및 UI 전면 배제 (단순 'AI 민간자격 개발(준비 중)' 안내 텍스트로만 대체).
  3. **[DEL-03] 회원/결제 모듈 제거**: 일반 방문자 회원가입, 로그인, 마이페이지, 수강신청, 결제/후원 모듈 완전 배제.
  4. **[DEL-04] 게시판 분리 제거**: 별도 분리된 교육/자료실/갤러리/뉴스 게시판을 폐지하고, 1개의 통합 게시판(`/updates`) 내 카테고리 필터 구조로 일원화.
  5. **[DEL-05] 불필요 UI/UX 제거**: 자동 슬라이더(캐러셀), 가상 통계 카운터, 전역 통합검색창, AI 챗봇 전면 배제 (차분하고 정적인 전문 기관 UI 준수).
  6. **[DEL-06] 더미 데이터 전면 삭제**: 개발용 가상 게시글, 임의 언론사 사진, 미확정 협력기관 로고 삭제. 승인된 콘텐츠가 0건일 시 섹션을 완전히 숨김(Hide).
  7. **[MOD-01/02] 원장 프로필 정비**: '박사과정'과 '박사학위'를 명확히 구분 표기하고, 원장 개인 실적(논문/강의/수상)과 진흥원 기관 실적을 엄격히 분리 표기.

---

## 1. 정보구조(IA) 및 사이트맵

MVP v3.0 규격에 따라 4개 상위 GNB와 7개 고정 페이지 + 1개 상세 템플릿으로 확정한다:

```text
/ (메인 포털 P-01)
├── 진흥원 소개       /about (P-02)
│   └── 원장 소개     /about/director (P-03)
├── 주요사업          /business (P-04)  [단일 페이지 내 4대 앵커 섹션]
│   ├── AI 기술개발 및 실증        #tech
│   ├── AI 민간자격 개발(준비 중)   #qualification
│   ├── 전문교육 및 인재양성       #edu
│   └── 조사·연구 및 산업협력      #research
├── 소식·성과        /updates (P-05)  [통합 게시판 1개]
│   └── 게시물 상세   /updates/:id (P-06)
├── 문의하기          /contact (P-07)  [SMTP 발송 문의 폼]
├── 정책             /privacy (P-08)  [개인정보처리방침]
└── 관리자 CMS (비공개) /admin  (noindex, GNB 노출 금지)
    ├── 로그인        /admin/login (ADM-01)
    └── 게시물 관리    /admin/posts (ADM-02)
```

### 1-1. 상위 네비게이션(GNB) 확정 (4개 메뉴)
- `진흥원 소개` (`/about`)
- `주요사업` (`/business`)
- `소식·성과` (`/updates`)
- `문의하기` (`/contact`)
- ※ 별도의 '정관' GNB나 '원장 활동' GNB는 생성하지 않음.

---

## 2. 화면별 핵심 요구사항 및 UX 규칙

### 2-1. 메인 페이지 (`P-01`, `/`)
1. **[헤더]**: 로고 + 4개 GNB + 모바일 햄버거 메뉴.
2. **[히어로 섹션]**:
   - 메인 타이틀: **“AI와 디지털 기술로 미래산업의 변화를 준비합니다.”**
   - 기관 서술: **“미래스마트산업진흥원은 인공지능·소프트웨어 분야의 조사·연구와 교육, 전문인력 양성, 기술 활용 및 산업 교류·협력을 추진하는 비영리 목적의 전문단체입니다.”**
   - CTA: `진흥원 소개 바로가기` → `/about`
3. **[주요사업 섹션]**:
   - 4개 사업 카드(PC 4열 / 태블릿 2열 / 모바일 1열): 카드 클릭 시 `/business#{앵커ID}`로 부드러운 스크롤 이동.
   - 카드 1: AI 기술개발 및 실증 (`#tech`)
   - 카드 2: AI 민간자격 개발 (`#qualification`, **‘준비 중’ 배지 필수**)
   - 카드 3: 전문교육 및 인재양성 (`#edu`)
   - 카드 4: 조사·연구 및 산업협력 (`#research`)
4. **[주요 성과 섹션]**:
   - 관리자에서 '메인 노출'로 승인된 최신 게시물 **최대 3건** 노출.
   - **[필수 예외처리] 등록된 승인 게시물이 0건인 경우, 가상 더미를 띄우지 않고 섹션 전체를 완전히 숨김(Hide)**.
5. **[원장 프로필 요약 섹션]**:
   - 김범준 원장 사진, 핵심 경력 요약, `원장 소개 상세 보기` CTA → `/about/director`.
6. **[협력 문의 섹션]**:
   - 제휴/연구/교육 협력 유도 문구 및 `문의하기` CTA → `/contact`.
7. **[푸터]**:
   - 기관명, 대표자 성명, 공식 이메일, 주소(미확정 정보는 숨김), 개인정보처리방침 링크, 정관 PDF 링크, Copyright.
   - **사업자등록번호는 정식 발급 전까지 일체 미노출**.

### 2-2. 진흥원 소개 (`P-02`, `/about`) & 원장 소개 (`P-03`, `/about/director`)
- `/about`: 비영리·공익성 서술, 4대 역할, 공개용 정관 PDF 다운로드 링크(`public/docs/articles-public.pdf`, 새창 열기), 원장 소개 링크 버튼.
- `/about/director`: 정식 프로필 사진, 25년 이상 경력 타임라인, 학력(**'박사과정' 및 수료 여부 사실대로 표기**, 학위 오인 방지), 대표 교육, 학술논문 2건(DOI 링크 명시), 대외활동.
- **실적 구분 고지**: 원장 개인의 연구/강의/수상 실적이 진흥원 기관 실적인 것처럼 오해되지 않도록 상단/영역별 명확한 분리 안내문 명기.
  - 논문 1: 김범준(2026), 「정보기술 직업교육 전문가들의 사이버보안 인식과 방향성 탐색」, 『융합과 통섭』 9(5), 309–325. (DOI: `https://doi.org/10.33090/SFCC.9.5.18`)
  - 논문 2: 김범준·김찬선(2025), 「생성형 인공지능 시대, IT산업의 윤리적 방향성 탐색: 저작권의 딜레마」, 『융합과 통섭』 8(5), 112–130. (DOI: `https://doi.org/10.33090/SFCC.8.5.8`)

### 2-3. 주요사업 (`P-04`, `/business`)
- 단일 페이지 내 4대 앵커 섹션: `tech`, `qualification`, `edu`, `research`.
- **민간자격 섹션 제약사항**:
  - 제목 옆에 **[준비 중]** 상태 명시.
  - "향후 국가공인 및 민간자격 기준에 맞추어 표준 교육체계를 연구·기획 중입니다" 안내문만 제공.
  - **접수하기, 시험 일정, 응시료 결제, 자격증 신청 버튼/링크 생성 엄격 금지**.
- 각 섹션 하단에 `사업 협력 문의하기` 버튼 연동 (`/contact?type=coop` 등).

### 2-4. 소식·성과 (`P-05`, `/updates`) & 상세 (`P-06`, `/updates/:id`)
- 통합 게시판 1개: 상단 탭 필터 [전체 | 공지사항 | 기관 활동/보도 | 학술논문 | 원장 대외활동].
- 썸네일(선택), 카테고리 태그, 제목, 요약문, 실제 발생일/발표일, 등록일, 페이지네이션.
- 데이터 0건 시 "등록된 게시물이 없습니다." 안내.
- 상세: 메타데이터 필드(DOI, 저자, 학술지명, 원본 기사 URL/언론사명), 허가받지 않은 기사 전문 복제 금지(3~4줄 요약+링크), `목록으로 돌아가기`, 비공개 글 접근 차단(404 처리).

### 2-5. 문의하기 (`P-07`, `/contact`) & 개인정보처리방침 (`P-08`, `/privacy`)
- 문의 폼: 성명, 이메일, 문의 유형(기관 및 사업 협력 / 전문 교육 문의 / 일반 문의), 소속(선택), 내용(10자 이상), 개인정보 수집/이용 동의 체크박스.
- 스팸 방지: Honeypot 필드, 소요 시간 검증, IP 레이트리밋.
- SMTP 전송: 지정된 진흥원 공식 수신 이메일로 발송.
- **피드백 원칙**: 실패 시 절대로 거짓 성공 메시지를 표출하지 않고 명확한 오류 안내 메시지 제공.
- `/privacy`: 문의하기 폼 수집 항목과 1:1로 일치하는 목적, 1년 보유 기간, 파기 절차 규정.

---

## 3. 데이터 모델 규격 (MongoDB / Mongoose)

```typescript
// 1. 관리자 계정 (adminUsers)
interface AdminUser {
  _id: ObjectId;
  username: string;          // 로그인 아이디 (unique)
  email: string;             // 기관 이메일 (unique)
  passwordHash: string;      // bcrypt (12 rounds)
  name: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  failedAttempts: number;    // 5회 실패 시 잠금
  lockUntil?: Date;
  lastLoginAt?: Date;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. 통합 게시물 v3 (posts)
interface Post {
  _id: ObjectId;
  category: 'notice' | 'activity' | 'paper' | 'director'; // 공지사항, 기관활동/보도, 학술논문, 원장 대외활동
  title: string;
  slug: string;              // URL 식별자 (unique)
  summary: string;           // 목록 요약문
  body: string;              // 마크다운 본문 (rehype-sanitize 살균)
  status: 'draft' | 'private' | 'public';
  isFeatured: boolean;       // 메인 노출 여부 (공개 상태 중 최대 3건 서버 제한)
  eventDate?: Date;          // 실제 행사일, 발표일, 보도일자
  sourceUrl?: string;        // 원본 기사 링크
  sourceName?: string;       // 언론사/출처명
  doi?: string;              // 학술논문 DOI 링크 (https://doi.org/...)
  authors?: string[];        // 논문 저자 목록
  journal?: string;          // 학술지명
  volumeIssuePages?: string; // 권(호), 페이지
  thumbnail?: {
    url: string;
    alt: string;             // 접근성 대체텍스트 (필수)
  };
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

// 3. 문의 내역 (inquiries) - 1년 TTL 자동 파기
interface Inquiry {
  _id: ObjectId;
  name: string;
  email: string;
  type: 'coop' | 'edu' | 'general';
  organization?: string;
  content: string;
  agreedPrivacy: boolean;
  status: 'received' | 'sent_smtp' | 'failed_smtp';
  ipAddress: string;
  userAgent: string;
  createdAt: Date;           // MongoDB TTL 인덱스 (expireAfterSeconds: 31536000)
}

// 4. 감사로그 (auditLogs) - Append-Only 불변 컬렉션
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

## 4. 콘텐츠 및 더미 데이터 정책 (Zero-Tolerance)

- **가상/더미 데이터 일체 금지 (DEL-06, AC-12)**:
  - 개발용 임의의 게시글, 가상 통계 수치, 임의 협력기관 로고 표기 금지.
  - 관리자가 승인한 게시물이 0건일 시 가상 게시글을 채우지 않고 "등록된 게시물이 없습니다."를 표시하거나 섹션 전체를 숨김 처리.
- **원장 실적 및 기관 실적 분리 (AC-05)**:
  - 원장 개인의 논문 2건 및 25년 경력은 원장 개인 소개(`/about/director`)에 명확히 표기.
  - 진흥원 자체의 수행 실적과 혼동되지 않도록 명확한 고지문 부착.


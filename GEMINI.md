# 미래스마트산업진흥원 안내 사이트 구축 — 하네스 엔지니어링 헌장

- **프로젝트명**: 미래스마트산업진흥원 홈페이지 통합 구축 (MVP) + 온라인 강좌 아카이브 시스템
- **기준 사양서**:
  1. [`docs/FSIPI_MVP_Website_Additional_Work_Order.md`](file:///apps/ex_project_InstituteofFutureSmartIndustry/docs/FSIPI_MVP_Website_Additional_Work_Order.md) (문서 번호: **FSIPI-WO-20261026-01**, 개정 최종 설계안 v3.0, 2026.10.26)
  2. [`docs/FSIPI_Lectures_System_Work_Order.md`](file:///apps/ex_project_InstituteofFutureSmartIndustry/docs/FSIPI_Lectures_System_Work_Order.md) (문서 번호: **FSIPI-WO-20261030-02**, KOCW형 차시별 유튜브 강의 및 노션 MD 아카이브, 2026.10.30)
- **성격**: 핵심 정보 제공 및 문의 기능 중심의 **공식 MVP 공공 포털** + **KOCW형 차시별 온라인 강좌 아카이브** + 운영자용 **관리자 CMS**
- **확정 기술 스택**: React + Next.js (App Router) + TypeScript + Tailwind CSS + MongoDB (GCP GCE 자체 운영) + Google Cloud (Cloud Run, VPC, GCS)

---

## 1. 프로젝트 6대 절대 가드레일 (Strict Invariants)

모든 에이전트는 아래 6대 원칙을 절대적으로 준수하며, 위배되는 코드나 아키텍처를 작성하지 않는다:

1. **AI 안내 도우미(챗봇/RAG/LLM) 및 불필요 UI 일체 제외**:
   - 대화형 챗봇, LLM 답변 생성, RAG 파이프라인 완전 배제 (DEL-05).
   - 자동 슬라이더(캐러셀), 가상 통계 카운터, 임의의 더미 콘텐츠 노출 금지.
2. **통합검색창 및 On-Device 의미 검색 기능 동결 (외부 API 유출 0건 유지)**:
   - 전역 통합검색창 및 대형 검색 파이프라인은 MVP에서 제거/동결 (DEL-05).
   - 외부 상용 LLM/클라우드 임베딩 API 전송 일체 금지 원칙은 엄격히 유지.
   - 통합 게시판(`/updates`) 내 필요한 경우 서버 키워드 검색(`$text`)만 선택적 제공.
3. **사업 신청·접수·결제 및 민간자격 시험/발급 기능 원천 배제**:
   - 사업안내 페이지는 **정보 안내 전용**이며, 온라인 접수/신청 폼, 신청하기 버튼, 결제 모듈 일체 금지 (DEL-02, DEL-03).
   - 민간자격은 **'AI 민간자격 개발(준비 중)'** 안내 텍스트로만 명기하고 시험 접수/합격 조회/발급 UI 완전 차단.
4. **MongoDB GCP GCE 자체 운영 (Atlas 금지 & VPC 격리)**:
   - MongoDB Atlas SaaS를 사용하지 않고, **GCP Compute Engine VM에 직접 설치·운영**.
   - 외부 공인 IP 미할당(No Public IP), 사설 서브넷(27017) 내부 통신, Serverless VPC Access 커넥터 연동, 매일 새벽 GCS 일일 자동 백업 스크립트 유지.
5. **관리자 직접 입력 인증 (Google OAuth 배제)**:
   - 구글 소셜 로그인을 사용하지 않고, **아이디/비밀번호 직접 입력 방식** 확정.
   - 로그인 식별자는 **사용자명(`username`) 및 기관 이메일(`email`)** 입력을 모두 지원.
   - Argon2id / bcrypt 해싱, 5회 연속 실패 시 15분 계정 잠금, IP 레이트리밋, HttpOnly/Secure/SameSite=Strict 세션 쿠키 격리.
6. **환경 중요 변수 `.env` 엄격 관리 (코드 내 디폴트값 전면 금지)**:
   - `MONGODB_URI`, `SESSION_SECRET`, `INITIAL_ADMIN_*`, `SMTP_*` 등 모든 중요 환경 변수는 반드시 `.env` 파일(운영: Secret Manager)을 통해서만 관리.
   - 코드베이스 내 `process.env.XXX || 'default'` 형태의 대체값(Fallback) 및 하드코딩된 자격증명/URI/시크릿 작성 일체 금지 (getDatabaseName 등 폴백 금지).
   - 필수 환경변수 누락 시 즉시 명시적 예외(`CRITICAL CONFIG ERROR`) 발생.
   - 클라이언트 번들에 관리자 비밀번호나 테스트 계정 정보를 하드코딩 노출하지 않음.

---

## 2. 전문 에이전트 팀 아키텍처 & 모델 티어링 맵

```mermaid
flowchart TD
    ORCH["총괄 아키텍트<br><b>Orchestrator</b> (Gemini Pro)"]
    
    subgraph FrontendTeam ["프론트엔드 & 포털"]
        PORTAL["공개 포털 엔지니어<br><b>Portal UI Engineer</b> (Gemini Flash)"]
        CMS["관리자 CMS 엔지니어<br><b>Admin CMS Engineer</b> (Gemini Flash)"]
    end

    subgraph CoreBackend ["코어 백엔드 & 인프라"]
        BE["백엔드 & DB 엔지니어<br><b>Backend & DB Engineer</b> (Gemini Pro)"]
        SEARCH["검색 & 데이터 엔지니어<br><b>Search & Data Specialist</b> (Gemini Pro)"]
        INFRA["클라우드 인프라 엔지니어<br><b>Cloud Infra & DevOps</b> (Gemini Flash)"]
    end

    QA["품질·보안·인수검수 심사위원<br><b>QA & Acceptance Critic</b> (Gemini Pro)"]

    ORCH --> PORTAL
    ORCH --> CMS
    ORCH --> BE
    ORCH --> SEARCH
    ORCH --> INFRA

    PORTAL -.산출물 제출.-> QA
    CMS -.산출물 제출.-> QA
    BE -.산출물 제출.-> QA
    SEARCH -.산출물 제출.-> QA
    INFRA -.산출물 제출.-> QA

    QA -.결함 지적 & 보완 요구.-> ORCH
```

### 에이전트 역할 및 모델 티어 배정

| 에이전트 | 모델 티어 | 주 임무 및 책임 (R&R) | 연계 스킬 및 도구 |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | **Gemini Pro** | WBS(M-00~M-11) 일정 조율, 요구사항 무결성 검증, 에이전트 간 작업 분배 | `harness`, `ralph-loop` |
| **Portal UI Engineer** | **Gemini Flash** | 4개 GNB, 메인(히어로/사업카드4/주요성과≤3/원장요약/CTA), 소개, 원장, 사업, 통합게시판, 문의 폼 | `smart-industry-cms` |
| **Admin CMS Engineer** | **Gemini Flash** | 직접 로그인, 게시물 CRUD, 메타데이터(DOI/행사일), 메인 노출(최대 3건), 공개/비공개 토글 | `smart-industry-cms`, `admin-security` |
| **Backend & DB Engineer** | **Gemini Pro** | Next.js Route Handlers, Server Actions, Post v3 스키마, Inquiry 폼 처리, SMTP 발송, 세션 보안 | `architecture-mongodb-gcp`, `admin-security` |
| **Search & Data Specialist** | **Gemini Pro** | 통합게시판 서버 텍스트 인덱스 검색, 레거시 온디바이스 검색 동결 및 형상 보존 | `on-device-search` |
| **Cloud Infra & DevOps** | **Gemini Flash** | GCE MongoDB 운영 유지, Cloud Run 배포, 백업/복구 스크립트, 도메인/DNS 인계 | `gcp-mongo-ops` |
| **QA & Acceptance Critic** | **Gemini Pro** | AC-01~15 인수검수 체크리스트 검증, Playwright E2E 자동 검사, KWCAG 2.2 웹 접근성 | `admin-security` |

---

## 3. 하네스 규칙 및 스킬 라우팅 맵

- [smart-industry-domain.md](file:///apps/ex_project_InstituteofFutureSmartIndustry/.agents/rules/smart-industry-domain.md): MVP v3.0 IA 사이트맵(4개 GNB, 7고정+1상세), 화면별 요구사항, Post v3 데이터 모델
- [architecture-mongodb-gcp.md](file:///apps/ex_project_InstituteofFutureSmartIndustry/.agents/rules/architecture-mongodb-gcp.md): GCE VM MongoDB 자체 운영, VPC 격리, Cloud Run, 일일 백업(GCS)
- [admin-security.md](file:///apps/ex_project_InstituteofFutureSmartIndustry/.agents/rules/admin-security.md): 직접 자격증명 인증, 5회 실패 잠금, 세션 쿠키, 감사로그, KWCAG 2.2 웹 접근성
- [git-workflow.md](file:///apps/ex_project_InstituteofFutureSmartIndustry/.agents/rules/git-workflow.md): 업무 단위별 원자적 Git Commit 규약 및 태그 컨벤션
- [harness-engineering.md](file:///apps/ex_project_InstituteofFutureSmartIndustry/.agents/rules/harness-engineering.md): 하네스 엔지니어링 헌장 및 5대 품질 패턴

---

## 4. WBS 및 공정 단계 (MVP v3.0 및 강좌 시스템 이행 공정)

### 4-1. 1차 포털 MVP 구축 공정 (M-00 ~ M-11 완료)
- **M-00. 거버넌스 정합 및 기준선 확보** (v1.2-final 태그, v3.0 하네스 헌장 개정)
- **M-01. [최우선] 삭제·동결 조치** (DEL-01 ~ DEL-06, 레거시 화면/모델/더미/통합검색/슬라이더 제거)
- **M-02. 정보구조·라우팅·레이아웃** (4개 GNB, 신규 Footer, 301 리디렉션 매핑)
- **M-03. 데이터 모델 & 관리자 API** (Post v3 스키마, CRUD API, 메인노출 3건 서버 제어, 미들웨어 proxy)
- **M-04. 메인 화면 [P-01] 구현** (히어로, 사업카드4, 성과 0건 숨김, 원장요약, 문의CTA)
- **M-05. 진흥원 소개 [P-02] & 원장 소개 [P-03]** (설립취지, 4대역할, 정관PDF, 25년경력 타임라인, 박사과정 명기, 논문2편 DOI)
- **M-06. 주요사업 [P-04] 구현** (단일 페이지 4개 앵커, 민간자격 '준비 중' 고지, 신청 버튼 일체 배제)
- **M-07. 소식·성과 [P-05] & 상세 [P-06]** (통합게시판 1개, 4개 카테고리 탭, 페이징, 상세 템플릿)
- **M-08. 문의하기 [P-07] & 개인정보처리방침 [P-08]** (문의 폼, SMTP 발송, 스팸 방지, 실패 피드백 철저, 방침 고지)
- **M-09. 관리자 CMS 고도화 [ADM-01, ADM-02]** (비공개 로그인, 게시물 CRUD, 메타데이터 입력, 메인 노출 지정)
- **M-10. 비기능적 요구사항(NFR) 최적화** (반응형 375/768/1440, 명암비 4.5:1, SEO 메타태그, sitemap, robots)
- **M-11. 인수검수(AC-01~15) & 산출물 인계** (Playwright 자동 검사, 운영 매뉴얼, 산출물 패키징 완료)

### 4-2. 2차 온라인 강좌 시스템 구축 공정 (L-00 ~ L-09 신규)
- **L-00. 거버넌스 정합 & 기준선 확보**: v1.3-mvp 태그, 헌장 v4.1.0 개정, 5대 GNB 정의, env 폴백 제거
- **L-01. 데이터 모델 및 검증**: Course, LectureAttachment 스키마, zod 검증, YouTube ID 정규화 추출기 단위 테스트, slug 및 slugHistory
- **L-02. 스토리지 계층 & 분할 업로드**: 5MB 청크 분할 업로드(GCS compose / 로컬 드라이버), 50MB 상한, 파일 서빙 라우트
- **L-02b. 텍스트 추출 & 부담 없는 미리보기**: PDF unpdf 추출, PDF 인라인 뷰어, Canva/Slides 임베드 및 업로드 파일 뷰어
- **L-03. 강좌 관리자 API**: `/api/admin/lectures` CRUD, 상태 제어, 정렬 순서 일괄 저장, plainText 자동 생성, 관리자 권한 메인 노출(최대 3건 서버 검증), 감사로그
- **L-04. 관리자 UI 고도화 [ADM-03, ADM-04]**: 강좌 목록, 등록/수정 폼, 차시 편집기(@dnd-kit 드래그+키보드), MD 업로더(실시간 미리보기, 개별 이미지 업로드, 누락 이미지 경고), 분할 업로드 진행률
- **L-04b. 메인 화면 강좌 노출 관리자 기능 [Q6]**: 관리자 권한 전용 메인 노출 토글 및 순서 제어 UI (일반 사용자 댓글/신청/회원가입 일체 차단)
- **L-05. 온라인 강좌 목록 [P-09]**: 카테고리/유형 탭, 강좌 내 $text 검색, 카드 그리드, 배지, 페이징, Empty State
- **L-06. KOCW형 차시별 동영상 강좌 상세 [P-10]**: 16:9 반응형 유튜브 플레이어(youtube-nocookie.com), SPA 차시 즉시 전환, 이전/다음 차시 버튼, 활성 행 하이라이트, `?ep=N` 차시 딥링크, 타인 공유 버튼, 교재 미리보기/다운로드
- **L-07. 노션 MD 텍스트 강좌 상세 [P-11]**: GitHub 스타일 마크다운 렌더링, 코드 하이라이트 & 복사, 표 가로스크롤, 라이트박스, Sticky TOC, 교재 첨부 배너
- **L-07b. 타인 공유 및 검색 최적화 [Q5]**: 강좌/차시별 generateMetadata, 동적 OG 이미지, JSON-LD, slugHistory 301 리디렉션
- **L-08. 시스템 통합 & NFR 최적화**: GNB 5대 메뉴 연동, 메인 화면(P-01) 강좌 섹션(관리자 지정 시만 노출, 0건 시 숨김), sitemap/robots 갱신, 접근성(a11y), 비공개 강좌 404 차단
- **L-09. 인수검수 (LAC-01 ~ LAC-18) & 납품 산출물**: 자동 검증 스크립트 작성 및 통과, 4대 추가 산출물 작성

---

## 5. 하네스 변경 이력 (Harness Changelog)

| 일자 | 버전 | 변경 내용 | 대상 파일 / 규칙 |
| :--- | :--- | :--- | :--- |
| 2026-10-30 | **v4.1.0** | **`docs/FSIPI_Lectures_System_Work_Order.md` (FSIPI-WO-20261030-02) 반영 온라인 강좌 시스템 구축 확장**:<br>① **5대 GNB 체계 개편**: `온라인 강좌`(`/lectures`) 메뉴 공식 추가 및 P-09, P-10, P-11, ADM-03, ADM-04 신설<br>② **가드레일 정합 해석**: RAG/MCP용 텍스트 필드 정규화 저장(외부 API 유출 0건 유지), 통합검색 제외 및 강좌 내 한정 `$text` 검색 적용<br>③ **아키텍처 확정**: 5MB 청크 분할 업로드(50MB 상한), 부담 없는 미리보기(PDF 인라인, Canva/Slides 임베드, 업로드 파일 뷰어), 관리자 권한 전용 메인 노출 제어(Q6), 타인 공유 목적 충족(slugHistory 301, 차시 딥링크, OG/JSON-LD, Q5)<br>④ **LAC-01 ~ LAC-18 인수검수 기준 확립** 및 L-00 ~ L-09 WBS 수립 | `GEMINI.md`, `AGENTS.md`, `smart-industry-domain.md` |
| 2026-10-26 | **v4.0.0** | **`docs/FSIPI_MVP_Website_Additional_Work_Order.md` (v3.0) 반영 MVP 전면 개편**:<br>① **DEL-01~06 즉시 반영**: 미래스마트산업연구소 사업자번호 삭제, 민간자격 시험/접수 완전 제거, 회원/결제 제거, 통합게시판 1개 단일화, 슬라이더/통계카운터/통합검색창 제거, 더미 데이터 전면 삭제<br>② **원장 프로필 정비**: '박사과정' 명기 및 진흥원 기관 실적과 원장 개인 실적 엄격 분리<br>③ **정보구조 일원화**: 4대 GNB, 7고정+1상세 URL 라우팅 및 301 리디렉션 매핑<br>④ **AC-01 ~ AC-15 인수검수 기준 확립** 및 M-00 ~ M-11 WBS 공정 수립 | `GEMINI.md`, `AGENTS.md`, `smart-industry-domain.md` |
| 2026-10-14 | **v3.1.0** | **환경 변수 `.env` 엄격 관리 및 코드 내 디폴트값 전면 금지 헌장 반영** | `GEMINI.md`, `AGENTS.md`, `admin-security.md` |
| 2026-10-14 | **v3.0.0** | 미래스마트산업진흥원 포털 + 관리자 CMS 도메인 규칙 신설 | `GEMINI.md`, `AGENTS.md`, `smart-industry-domain.md` |


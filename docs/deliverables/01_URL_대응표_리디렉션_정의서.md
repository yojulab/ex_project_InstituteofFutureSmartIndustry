# [산출물 01] 최종 URL 대응표 및 301 영구 리디렉션 정의서

- **문서 번호:** FSIPI-DELIV-01
- **문서명:** 미래스마트산업진흥원 홈페이지 통합 구축(MVP) URL 대응표 및 리디렉션 정의서
- **발행 일자:** 2026년 10월 26일
- **기준 사양:** `docs/FSIPI_MVP_Website_Additional_Work_Order.md` (§3.2, §3.3) 및 기획안 v3.0

---

## 1. 개요

기존 임시/테스트 사이트(axfoundly 등) 및 1차 개발 시 분산되어 있던 URL 경로로 유입되는 검색엔진 봇과 사용자를 누락 없이 신규 표준 7개 고정 페이지 및 1개 상세 템플릿으로 안전하게 유도하기 위해 HTTP 301 Permanent Redirect 매핑을 적용한다.

---

## 2. 표준 정보구조(IA) 및 URL 매핑표

| 페이지 ID | 표준 URL | 페이지명 | 주요 기능 및 구성 |
| :--- | :--- | :--- | :--- |
| **P-01** | `/` | **메인** | 로고, 4대 GNB, 대표 히어로, 사업안내 카드 4종, 주요 성과(최대 3건, 0건 숨김), 원장 프로필 요약, 문의 CTA, 푸터 |
| **P-02** | `/about` | **진흥원 소개** | 설립 취지, 4대 역할, 공개용 정관(PDF) 다운로드/열람, 원장 소개 바로가기 |
| **P-03** | `/about/director` | **원장 소개** | 원장 프로필, 25년 이상 경력 타임라인, 학력(박사과정 명기), 학술논문 2건(DOI 연결), 기관/개인 실적 분리 고지 |
| **P-04** | `/business` | **주요사업** | 단일 페이지 4대 앵커 (`#tech`, `#qualification`[준비 중], `#edu`, `#research`), 사업 협력 문의 연동, 신청버튼 배제 |
| **P-05** | `/updates` | **소식·성과** | 통합 게시판 1개, 상단 탭 4종(전체, 공지사항, 기관 활동/보도, 학술논문, 원장 대외활동), 페이징, 키워드 검색 |
| **P-06** | `/updates/:id` | **게시물 상세** | 공통 템플릿, 카테고리 배지, 제목, 등록일/행사일, 본문(살균 마크다운), DOI/언론사 출처 링크, 썸네일 |
| **P-07** | `/contact` | **문의하기** | 문의 폼 (성명, 이메일, 유형, 소속, 내용, 개인정보 동의), Honeypot/IP제한, SMTP 발송, 명확한 피드백 |
| **P-08** | `/privacy` | **개인정보처리방침** | 문의 접수 및 사이트 운영 기준 개인정보 수집/이용/보유(1년)/파기 방침 고지 |
| **ADM-01**| `/admin/login` | **관리자 로그인** | 비공개 관리자 인증 화면 (GNB 노출 금지, 5회 실패 잠금, 보안 쿠키) |
| **ADM-02**| `/admin/posts` | **관리자 게시물 관리**| 게시글 등록/수정/삭제, 카테고리 지정, 메타데이터 입력, 메인 노출(최대 3건) 설정, 공개/비공개 토글 |

---

## 3. 레거시 경로 301 영구 리디렉션 매핑 규칙

`next.config.ts`의 `redirects()`를 통해 서버 엔진 레벨에서 즉시 301 응답을 반환한다.

| 구분 | 레거시 URL 경로 | 신규 표준 대상 경로 | HTTP 상태 코드 | 리디렉션 사유 |
| :--- | :--- | :--- | :--- | :--- |
| **소개 하위** | `/about/vision`<br>`/about/history`<br>`/about/organization`<br>`/about/location` | `/about` | `301 Moved Permanently` | 분산된 소개 하위 페이지를 단일 기관 소개 페이지로 통합 |
| **사업안내** | `/programs`<br>`/programs/:slug*` | `/business` | `301 Moved Permanently` | 복수 페이지 목록/상세 구조를 단일 페이지 4대 앵커 구조로 일원화 (신청기능 원천 배제) |
| **알림/자료/검색**| `/news`<br>`/news/:path*`<br>`/resources`<br>`/resources/:path*`<br>`/search` | `/updates` | `301 Moved Permanently` | 분산 게시판(뉴스, 자료실 등) 및 별도 검색창을 1개의 통합 게시판(`/updates`)으로 통합 |
| **이용안내/문의**| `/guide/contact` | `/contact` | `301 Moved Permanently` | 단순 연락처 안내 페이지를 실동작 문의 폼 페이지로 개편 |
| **기타 이용안내**| `/guide/faq`<br>`/guide/sitemap`<br>`/guide`<br>`/guide/:path*` | `/` | `301 Moved Permanently` | MVP 제외 대상(FAQ, 사이트맵 등) URL의 홈 리디렉션 |
| **비표준 정책** | `/copyright`<br>`/accessibility` | `/privacy` | `301 Moved Permanently` | 비표준 분리 정책을 표준 개인정보처리방침 및 KWCAG 접근성 지침 준수 체계로 일원화 |
| **관리자 기본** | `/admin`<br>`/admin/dashboard` | `/admin/posts` | `301 Moved Permanently` | 불필요 대시보드 제거 및 핵심 업무인 게시물 관리 화면으로 즉시 진입 |

---

## 4. 검증 결과

- 모든 301 리디렉션 규칙은 `curl -I` 및 Playwright 자동 테스트(`AC-03`)를 통해 HTTP 301 상태코드와 정확한 `Location` 헤더 전달 여부를 검증 완료함.

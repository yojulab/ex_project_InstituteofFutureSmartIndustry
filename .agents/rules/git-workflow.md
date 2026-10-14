# Git 워크플로우 & 업무 종료 커밋 규약 (Git Commit Rules)

본 문서는 **미래스마트산업진흥원 안내 사이트 구축 프로젝트**에서 모든 에이전트와 개발자가 작업을 수행하고 종료할 때 준수해야 하는 **Git Commit 표준 지침**이다.

---

## 1. 커밋 시점 및 의무 원칙

### 1-1. 업무 단위별 Git Commit 필수
- 에이전트는 기획/인터페이스 정의, 컴포넌트 개발, DB 스키마 작성, API 엔드포인트 구현, 검색 엔진 결합, 보안 검증 등 **유의미한 단위 작업(WBS T-01 ~ T-25)을 완료할 때마다 반드시 Git Commit을 수행**해야 한다.
- Ralph Loop 실행 중에도 각 마일스톤이나 서브태스크가 완료되면 즉시 커밋하여 디스크 상에 상태를 영속화(State on Disk)한다.

### 1-2. 원자적 커밋 (Atomic Commits)
- 여러 영역(예: 포털 UI와 GCE MongoDB 백업 스크립트)의 작업을 한데 뭉뚱그려 커밋하지 않고, 독립적인 기능/화면/인프라 단위별로 원자적으로 커밋한다.
- 커밋 전 `git status`와 `git diff`를 확인하여 의도하지 않은 임시 파일이나 비밀키가 포함되지 않았는지 점검한다.

---

## 2. 커밋 메시지 컨벤션

커밋 메시지는 다음 접두어와 WBS ID를 연계하여 명확히 기술한다:

| 타입 | 의미 | 예시 |
| :--- | :--- | :--- |
| **`feat:`** | 신규 화면, 컴포넌트, API, 검색 엔진 구현 | `feat(portal): 메인 포털 히어로 및 새소식 탭 컴포넌트 구현 [T-08]`<br>`feat(admin): 관리자 직접 로그인(Argon2id) 및 5회 실패 잠금 로직 [T-05]`<br>`feat(search): Web Worker Transformers.js On-Device 의미검색 결합 [T-19]` |
| **`infra:`** | GCP 인프라, GCE MongoDB, VPC 커넥터, 백업 스크립트 | `infra(mongodb): GCE VM MongoDB 보안 설정 및 mongodump GCS 백업 Cron [T-03, T-04]`<br>`infra(vpc): Serverless VPC Access 커넥터 연동 구성 [T-02]` |
| **`arch:`** | 시스템 아키텍처, Mongoose 데이터 모델, 스키마 정의 | `arch(db): Mongoose 5대 핵심 스키마(AdminUser, Post, Program 등) 정의 [T-06]` |
| **`docs:`** | 작업지시서, WBS, 인계 Runbook, 관리자 매뉴얼 | `docs: 관리자 CMS 운영 매뉴얼 및 DB 복구 Runbook 작성 [T-25]` |
| **`rule:`** | 하네스 규칙, 에이전트 역할, 전용 스킬 갱신 | `rule: 미래스마트산업진흥원 v1.2 하네스 프롬프트 및 온디바이스 검색 룰 갱신` |
| **`test:`** | Playwright E2E(트래픽 격리 검증), 접근성, 성능 테스트 | `test(search): 온디바이스 의미검색 시 외부 API 요청 0건 Playwright E2E 검증 [T-20]`<br>`test(a11y): axe-core 웹 접근성 자동 검사 슈트 추가 [T-22]` |
| **`chore:`** | 환경 설정, .gitignore, 패키지 의존성 관리 | `chore: Next.js App Router + TypeScript + Tailwind 초기 설정 [T-01]` |

---

## 3. 커밋 전 보안 및 무결성 체크리스트

1. **비밀정보 배제**: 실제 GCP 서비스 계정 키, DB 패스워드, JWT 세션 시크릿이 담긴 `.env` 또는 `key.json` 파일이 포함되지 않았는가? (`.gitignore` 확인)
2. **범위 제외 항목 준수**: 
   - 챗봇/외부 LLM API 호출 코드가 포함되지 않았는가?
   - 사업 신청/접수 폼 및 버튼이 포함되지 않았는가?
3. **루프 완료 약속 연계**: Ralph Loop 활성화 시 태스크 체크리스트(`.agents/loop/task.md`)의 진전 사항과 커밋 내용이 일치하는가?

# GCP 인프라 & 자체 운영 MongoDB 아키텍처 가이드

- **문서 참조**: `docs/작업지시서.md` §5 (기술 스택 및 아키텍처), §5.2~5.3 (GCP 구성), §9 (WBS T-02~T-04)
- **핵심 인프라 방침**: 
  1. **MongoDB 자체 운영**: Atlas SaaS가 아닌 **GCP Compute Engine(GCE) VM**에 MongoDB 직접 설치·운영
  2. **VPC 사설망 완전 격리**: DB VM은 외부 공인 IP를 갖지 않으며(No Public IP), 사설 서브넷(27017) 내부에서만 통신
  3. **Serverless VPC Access**: Cloud Run(Next.js)과 GCE VM을 전용 커넥터로 연결
  4. **자동 백업 파이프라인**: VM 내부 Cron을 통해 매일 새벽 `mongodump` 실행 후 Cloud Storage(GCS)로 아카이빙

---

## 1. 시스템 구성도

```mermaid
flowchart TD
    subgraph Users ["사용자 계층"]
        PUB["방문자 (PC / 모바일)"]
        ADM["기관 관리자"]
    end

    subgraph GCP ["Google Cloud Platform (서울 리전: asia-northeast3)"]
        LB["Cloud Load Balancing + Cloud CDN + Cloud Armor (WAF)"]

        subgraph Serverless ["App 계층 (Serverless)"]
            CR["Cloud Run: Next.js App<br>(SSR / Public Pages / Admin / APIs)"]
            JOB["Cloud Run Job:<br>검색 인덱스 & 임베딩 빌더"]
        end

        subgraph VPC ["Custom VPC Network (Private Subnet)"]
            SVPCC["Serverless VPC Access 커넥터"]
            
            subgraph GCE ["Database 계층 (GCE VM)"]
                VM["Compute Engine (e2-standard-2 / Ubuntu 24.04)<br><b>MongoDB 자체 운영 (SCRAM-SHA-256)</b>"]
                PD[("Persistent Disk (Balanced SSD 50~100GB)<br>데이터 볼륨")]
                VM --- PD
            end
        end

        subgraph Storage ["스토리지 & 보안 계층"]
            GCS_MEDIA[("Cloud Storage (첨부/이미지)")]
            GCS_AI[("Cloud Storage (search-index.json / AI 모델)")]
            GCS_BACKUP[("Cloud Storage (DB 일일 백업 아카이브)")]
            SM["Secret Manager (DB 접속문자열, 세션 시크릿)"]
        end
    end

    PUB -->|HTTPS| LB
    ADM -->|HTTPS| LB
    LB --> CR
    
    CR -->|환경변수 주입| SM
    CR -->|서명 업로드/다운로드| GCS_MEDIA
    CR -->|VPC 커넥터 경유| SVPCC
    SVPCC -->|내부 IP 통신 (27017)| VM

    CR -.게시물 변경 트리거.-> JOB
    JOB -->|데이터 추출| SVPCC
    JOB -->|인덱스 파일 배포| GCS_AI

    PUB -.인덱스 & 모델 다운로드.-> GCS_AI

    VM -.일일 자동 백업 (mongodump).-> GCS_BACKUP
```

---

## 2. GCP 인프라 상세 스펙

### 2-1. Next.js App (Cloud Run)
- **컨테이너 환경**: 무상태(Stateless) 도커 컨테이너, CPU 1~2 vCPU, RAM 1~2GB.
- **스케일링**: 0~10 인스턴스 자동 확장, 최소 인스턴스 1대 유지(콜드스타트 방지).
- **VPC 연동**: `Serverless VPC Access Connector`를 통해 서브넷 내부 IP(`10.x.x.x`)로 DB 접속.
- **보안 헤더**: HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Strict CSP.

### 2-2. MongoDB GCE VM (Compute Engine)
- **인스턴스 스펙**: `e2-standard-2` (2 vCPU, 8GB RAM), Ubuntu 24.04 LTS.
- **스토리지**: Persistent Disk (Balanced SSD) 50GB~100GB, 마운트 경로 `/var/lib/mongodb`.
- **네트워크 보안**:
  - **No External IP (외부 공인 IP 미할당)**.
  - VPC 방화벽: 외부 인터넷의 `27017` 인바운드 100% 차단.
  - Serverless VPC Connector 서브넷 IP 대역에서만 `tcp:27017` 인바운드 허용.
  - OS 패키지 업데이트는 Cloud NAT를 통해 아웃바운드만 허용.
- **DB 보안 설정**:
  - `mongod.conf`: `security.authorization: enabled` (SCRAM-SHA-256 인증 활성화).
  - 관리자 계정(`admin`) 및 전용 애플리케이션 계정(`fsi_app`)의 읽기/쓰기 최소 권한 원칙 적용.

### 2-3. 일일 자동 백업 파이프라인 (GCS 연동)
- **백업 주기**: 매일 새벽 03:00 (KST) VM 내부 Cron 실행.
- **백업 절차**:
  ```bash
  # 1. 덤프 추출
  mongodump --uri="mongodb://fsi_app:...@127.0.0.1:27017/fsi_portal?authSource=fsi_portal" --out=/backup/dump_$(date +%Y%m%d)
  
  # 2. 압축 및 암호화
  tar -czf /backup/fsi_db_$(date +%Y%m%d).tar.gz /backup/dump_$(date +%Y%m%d)
  
  # 3. GCS 전송
  gcloud storage cp /backup/fsi_db_$(date +%Y%m%d).tar.gz gs://[진흥원-db-backups]/daily/
  
  # 4. 로컬 임시파일 정리
  rm -rf /backup/dump_* /backup/*.tar.gz
  ```
- **수명주기 정책(Lifecycle)**: 30일 경과 백업본 자동 삭제, 14일 경과 시 Coldline 스토리지 전환.
- **복구 리허설**: 주기적인 복구(`mongorestore`) 시뮬레이션을 수행하여 백업 데이터 무결성 검증.

---

## 3. 백엔드 개발 및 데이터 무결성 가이드

1. **Mongoose ODM 패턴**:
   - 싱글톤 커넥션 관리(Next.js HMR 캐싱 대응 `global.mongoose`).
   - 모든 모델 스키마에 `timestamps: true` 및 Soft Delete(`deletedAt`) 필드 내장.
2. **NoSQL Injection 방어**:
   - zod 스키마 검증을 거친 정제된 기본 타입(string, number, boolean)만 쿼리 인자로 주입.
   - `$where`, `$regex` 등 임의 객체 주입 차단.
3. **파일 업로드**:
   - 서버를 거치지 않고 Cloud Storage 서명 URL(Signed URL)을 발급받아 브라우저에서 직접 GCS 업로드.
   - 확장자 화이트리스트(`pdf`, `hwp`, `hwpx`, `docx`, `xlsx`, `pptx`, `jpg`, `jpeg`, `png`, `webp`) 및 용량(개당 50MB 이내) 엄격 검증.

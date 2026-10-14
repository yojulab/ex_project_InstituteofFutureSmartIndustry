---
name: gcp-mongo-ops
description: "GCP 인프라 프로비저닝 및 GCE 자체 운영 MongoDB 구축·운영 스킬. GCP VPC 네트워크, Serverless VPC Access 커넥터 설정, GCE VM MongoDB 설치, No Public IP 보안 격리, SCRAM-SHA-256 인증, 일일 자동 mongodump 백업(GCS 연동) 및 복구(restore) 리허설 수행 시 사용한다."
---

# GCP 인프라 & GCE MongoDB 자체 운영 스킬

미래스마트산업진흥원 포털의 백엔드 데이터베이스를 GCP Compute Engine VM에 자체 구축하고, 안전한 사설망 통신 및 자동 백업 체계를 운영하는 절차입니다.

---

## 1. GCE VM MongoDB 자체 구축 절차 (WBS T-03)

### 1-1. VM 인스턴스 사양 및 네트워크
- **리전/존**: `asia-northeast3-a` (서울)
- **머신 타입**: `e2-standard-2` (2 vCPU, 8GB RAM)
- **OS**: Ubuntu 24.04 LTS
- **디스크**: Balanced SSD 50GB~100GB 마운트 (`/var/lib/mongodb`)
- **공인 IP**: **미할당 (`--no-address`)**
- **서브넷**: `fsi-internal-subnet` (10.10.0.0/24)

### 1-2. MongoDB 설치 및 보안 설정
```bash
# 1. MongoDB 7.0 / 8.0 설치
sudo apt update && sudo apt install -y mongodb-org

# 2. 관리자 및 애플리케이션 유저 생성
mongosh <<EOF
use admin
db.createUser({
  user: "fsi_admin",
  pwd: "STRONG_ADMIN_PASSWORD_FROM_SECRET_MANAGER",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, { role: "readWriteAnyDatabase", db: "admin" } ]
})

use fsi_portal
db.createUser({
  user: "fsi_app",
  pwd: "STRONG_APP_PASSWORD_FROM_SECRET_MANAGER",
  roles: [ { role: "readWrite", db: "fsi_portal" } ]
})
EOF

# 3. mongod.conf 설정
# bindIp: 127.0.0.1, 10.10.0.X (VM 내부 사설 IP)
# security:
#   authorization: enabled
sudo systemctl restart mongod
```

---

## 2. Serverless VPC Access 커넥터 연동 (WBS T-02)

1. **커넥터 생성**:
   ```bash
   gcloud compute networks vpc-access connectors create fsi-vpc-connector \
     --region=asia-northeast3 \
     --range=10.8.0.0/28 \
     --network=fsi-vpc
   ```
2. **Cloud Run 서비스 연결**:
   ```bash
   gcloud run deploy fsi-portal-web \
     --image=asia-northeast3-docker.pkg.dev/.../fsi-web:latest \
     --vpc-connector=fsi-vpc-connector \
     --vpc-egress=private-ranges-only \
     --set-env-vars=MONGODB_URI="mongodb://fsi_app:PW@10.10.0.X:27017/fsi_portal?authSource=fsi_portal"
   ```

---

## 3. 일일 자동 백업 및 복구 파이프라인 (WBS T-04)

### 3-1. 백업 스크립트 (`/opt/scripts/backup_mongo.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
BUCKET="gs://fsi-db-backups-asia-northeast3/daily"

mkdir -p "$BACKUP_DIR"

# 1. 덤프 생성
mongodump --uri="mongodb://fsi_admin:${DB_PASS}@127.0.0.1:27017/fsi_portal?authSource=admin" --out="${BACKUP_DIR}/dump_${DATE}"

# 2. 압축
tar -czf "${BACKUP_DIR}/fsi_dump_${DATE}.tar.gz" -C "${BACKUP_DIR}" "dump_${DATE}"

# 3. Cloud Storage 업로드
gcloud storage cp "${BACKUP_DIR}/fsi_dump_${DATE}.tar.gz" "${BUCKET}/"

# 4. 임시 파일 정리
rm -rf "${BACKUP_DIR}/dump_${DATE}" "${BACKUP_DIR}/fsi_dump_${DATE}.tar.gz"
```
- Crontab 등록: `0 3 * * * /opt/scripts/backup_mongo.sh >> /var/log/mongo_backup.log 2>&1`

### 3-2. 복구(Restore) 리허설 절차
1. 최신 백업 아카이브 다운로드: `gcloud storage cp gs://.../daily/fsi_dump_YYYYMMDD.tar.gz .`
2. 압축 해제 및 복구 명령:
   `mongorestore --uri="mongodb://fsi_admin:${DB_PASS}@127.0.0.1:27017/?authSource=admin" --drop ./dump_YYYYMMDD/`
3. 데이터 건수 및 컬렉션 정합성 검증 확인서 작성.

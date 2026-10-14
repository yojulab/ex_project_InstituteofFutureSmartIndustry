#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — MongoDB 일일 자동 백업 및 GCS 전송 스크립트 (T-04)
# 실행 주기: 매일 새벽 03:00 (Cron: 0 3 * * *)
# ==============================================================================
set -euo pipefail

BACKUP_BUCKET="${GCS_BACKUP_BUCKET:-smart-industry-db-backups}"
BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="smart_industry_backup_${TIMESTAMP}.tar.gz"
TEMP_DUMP_DIR="/tmp/mongodump_${TIMESTAMP}"

# DB 자격증명 (코드 내 디폴트 금지, 환경변수 필수)
DB_USER="${DB_BACKUP_USER:?오류: DB_BACKUP_USER 환경변수가 정의되지 않았습니다.}"
DB_PASS="${DB_BACKUP_PASS:?오류: DB_BACKUP_PASS 환경변수가 정의되지 않았습니다.}"
DB_NAME="${DB_NAME:?오류: DB_NAME 환경변수가 정의되지 않았습니다.}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Backup] Starting daily mongodump..."
mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DUMP_DIR"

# 1. mongodump 실행
mongodump \
  --host="127.0.0.1:27017" \
  --username="$DB_USER" \
  --password="$DB_PASS" \
  --authenticationDatabase="admin" \
  --db="$DB_NAME" \
  --out="$TEMP_DUMP_DIR"

# 2. 압축 아카이브 생성
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Backup] Compressing dump archive to $ARCHIVE_NAME..."
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "$TEMP_DUMP_DIR" .
rm -rf "$TEMP_DUMP_DIR"

# 3. Google Cloud Storage(GCS)로 안전 전송
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Backup] Uploading to gs://${BACKUP_BUCKET}/mongodb-backups/..."
if command -v gcloud &> /dev/null; then
  gcloud storage cp "${BACKUP_DIR}/${ARCHIVE_NAME}" "gs://${BACKUP_BUCKET}/mongodb-backups/${ARCHIVE_NAME}"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Backup] Successfully uploaded to GCS."
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Backup Warning] gcloud CLI not found, archive saved locally only."
fi

# 4. 로컬 보관 주기 관리 (최근 3일 보관 후 자동 정리)
find "$BACKUP_DIR" -type f -name "smart_industry_backup_*.tar.gz" -mtime +3 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Backup] Daily backup routine completed successfully."

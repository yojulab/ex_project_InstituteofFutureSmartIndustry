#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — MongoDB 백업 복구(Restore) 리허설 검증 스크립트 (T-04)
# 재해 복구(DR) 대비 백업 데이터 무결성 및 복원 정상 동작 검증
# ==============================================================================
set -euo pipefail

BACKUP_BUCKET="${GCS_BACKUP_BUCKET:-smart-industry-db-backups}"
DRILL_DIR="/tmp/mongodb_restore_drill"
TARGET_TEST_DB="smart_industry_restore_test"

DB_USER="${DB_BACKUP_USER:-admin}"
DB_PASS="${DB_BACKUP_PASS:-AdminSecureBackupPass!}"

echo "==> [1/4] 복구 리허설 임시 디렉터리 준비..."
rm -rf "$DRILL_DIR"
mkdir -p "$DRILL_DIR"

echo "==> [2/4] 최신 백업 아카이브 확인 및 다운로드..."
if command -v gcloud &> /dev/null; then
  LATEST_BACKUP=$(gcloud storage ls "gs://${BACKUP_BUCKET}/mongodb-backups/smart_industry_backup_*.tar.gz" | sort -r | head -n 1)
  echo "최신 백업 파일 발견: $LATEST_BACKUP"
  gcloud storage cp "$LATEST_BACKUP" "$DRILL_DIR/latest_backup.tar.gz"
else
  # 로컬 백업 디렉터리에서 최신 파일 탐색
  LOCAL_BACKUP=$(find /var/backups/mongodb -name "smart_industry_backup_*.tar.gz" 2>/dev/null | sort -r | head -n 1 || true)
  if [ -n "$LOCAL_BACKUP" ]; then
    echo "로컬 백업 파일 활용: $LOCAL_BACKUP"
    cp "$LOCAL_BACKUP" "$DRILL_DIR/latest_backup.tar.gz"
  else
    echo "[Error] 복구할 백업 파일을 찾을 수 없습니다."
    exit 1
  fi
fi

echo "==> [3/4] 백업 압축 해제..."
tar -xzf "$DRILL_DIR/latest_backup.tar.gz" -C "$DRILL_DIR"

echo "==> [4/4] mongorestore 실행 (검증용 대상 DB: $TARGET_TEST_DB)..."
mongorestore \
  --host="127.0.0.1:27017" \
  --username="$DB_USER" \
  --password="$DB_PASS" \
  --authenticationDatabase="admin" \
  --nsInclude="smart_industry.*" \
  --nsFrom="smart_industry.*" \
  --nsTo="${TARGET_TEST_DB}.*" \
  --drop \
  "$DRILL_DIR"

echo "==> [검증] 복원된 컬렉션 문서 수 조회..."
mongosh admin \
  -u "$DB_USER" \
  -p "$DB_PASS" \
  --authenticationDatabase admin \
  --eval "
    const testDb = db.getSiblingDB('$TARGET_TEST_DB');
    const collections = testDb.getCollectionNames();
    print('복원된 컬렉션 목록: ' + collections.join(', '));
    collections.forEach(col => {
      print(' - ' + col + ': ' + testDb.getCollection(col).countDocuments() + '건');
    });
  "

echo "==> 복구 리허설 임시 디렉터리 정리..."
rm -rf "$DRILL_DIR"

echo "=============================================================================="
echo "✓ MongoDB 복원 리허설(Restore Drill)이 성공적으로 완료되었습니다."
echo "=============================================================================="

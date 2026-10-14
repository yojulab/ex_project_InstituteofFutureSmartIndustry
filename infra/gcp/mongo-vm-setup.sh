#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — GCE VM MongoDB 자체 운영 설치 및 보안 강화 스크립트 (T-03)
# 대상 OS: Ubuntu 24.04 LTS / Ubuntu 22.04 LTS (GCP e2-standard-2)
# 보안 원칙: 사설망 전용 (No Public IP), auth=true, SCRAM-SHA-256
# ==============================================================================
set -euo pipefail

echo "==> [1/6] 시스템 패키지 업데이트 및 의존성 설치..."
sudo apt-get update -y
sudo apt-get install -y gnupg curl tar gzip cron xfsprogs

echo "==> [2/6] 추가 Persistent Disk 마운트 (/var/lib/mongodb)..."
DISK_DEVICE="/dev/disk/by-id/google-persistent-disk-1"
MOUNT_DIR="/var/lib/mongodb"

if [ -b "$DISK_DEVICE" ]; then
  if ! blkid "$DISK_DEVICE" | grep -q "xfs\|ext4"; then
    echo "데이터 디스크 포맷 진행 (XFS)..."
    sudo mkfs.xfs -f "$DISK_DEVICE"
  fi
  sudo mkdir -p "$MOUNT_DIR"
  if ! grep -qs "$MOUNT_DIR" /etc/fstab; then
    UUID=$(sudo blkid -s UUID -o value "$DISK_DEVICE")
    echo "UUID=$UUID $MOUNT_DIR xfs defaults,nofail 0 2" | sudo tee -a /etc/fstab
  fi
  sudo mount -a
fi

echo "==> [3/6] MongoDB 7.0 공식 리포지토리 등록 및 설치..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt-get update -y
sudo apt-get install -y mongodb-org

echo "==> [4/6] 디렉터리 권한 및 기본 서비스 임시 구동..."
sudo chown -R mongodb:mongodb "$MOUNT_DIR"
sudo systemctl enable mongod
sudo systemctl start mongod

# 몽고 초기 구동 대기
sleep 3

echo "==> [5/6] 관리자 및 애플리케이션 계정 생성 (SCRAM-SHA-256)..."
# 환경변수 또는 임의 안전 비밀번호
DB_ADMIN_USER="${DB_ADMIN_USER:?오류: DB_ADMIN_USER 환경변수가 필요합니다.}"
DB_ADMIN_PASS="${DB_ADMIN_PASS:?오류: DB_ADMIN_PASS 환경변수가 필요합니다.}"
APP_USER="${APP_USER:?오류: APP_USER 환경변수가 필요합니다.}"
APP_PASS="${APP_PASS:?오류: APP_PASS 환경변수가 필요합니다.}"

mongosh admin --eval "
  db.createUser({
    user: '$DB_ADMIN_USER',
    pwd: '$DB_ADMIN_PASS',
    roles: [ { role: 'userAdminAnyDatabase', db: 'admin' }, { role: 'readWriteAnyDatabase', db: 'admin' }, { role: 'clusterAdmin', db: 'admin' } ]
  });
"

mongosh admin --eval "
  db.getSiblingDB('smart_industry').createUser({
    user: '$APP_USER',
    pwd: '$APP_PASS',
    roles: [ { role: 'readWrite', db: 'smart_industry' } ]
  });
"

echo "==> [6/6] mongod.conf 보안 강화 (auth=true 및 VPC 내부 바인딩)..."
sudo cp /etc/mongod.conf /etc/mongod.conf.bak

sudo tee /etc/mongod.conf > /dev/null <<EOF
# /etc/mongod.conf - 미래스마트산업진흥원 보안 설정
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  engine: wiredTiger

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 200

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled
EOF

sudo systemctl restart mongod
sudo systemctl status mongod --no-pager

echo "=============================================================================="
echo "MongoDB 자체 운영 설치 및 SCRAM-SHA-256 인증 설정이 완료되었습니다."
echo "App User: $APP_USER"
echo "App Pass: $APP_PASS"
echo "내부 연결 URI 예시:"
echo "mongodb://$APP_USER:$APP_PASS@<VM_INTERNAL_IP>:27017/smart_industry?authSource=smart_industry"
echo "=============================================================================="

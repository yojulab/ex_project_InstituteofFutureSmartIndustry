#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — GCP VPC, Serverless VPC Access 및 Cloud Run 배포 스크립트 (T-02, T-24)
# 대상 리전: 서울 (asia-northeast3)
# ==============================================================================
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:?오류: GCP_PROJECT_ID 환경변수가 필요합니다.}"
REGION="asia-northeast3"
VPC_NAME="smart-industry-vpc"
SUBNET_APP="subnet-asia-northeast3-app"
SUBNET_DB="subnet-asia-northeast3-db"
CONNECTOR_NAME="smart-industry-connector"
VM_NAME="mongodb-vm-primary"
SERVICE_NAME="smart-industry-web"

echo "==> [1/7] GCP 프로젝트 설정 및 필수 API 활성화..."
gcloud config set project "$PROJECT_ID"
gcloud services enable \
  compute.googleapis.com \
  run.googleapis.com \
  vpcaccess.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com

echo "==> [2/7] 커스텀 사설 VPC 네트워크 및 서브넷 생성..."
if ! gcloud compute networks describe "$VPC_NAME" &>/dev/null; then
  gcloud compute networks create "$VPC_NAME" --subnet-mode=custom
fi

if ! gcloud compute networks subnets describe "$SUBNET_DB" --region="$REGION" &>/dev/null; then
  gcloud compute networks subnets create "$SUBNET_DB" \
    --network="$VPC_NAME" \
    --region="$REGION" \
    --range="10.10.2.0/24"
fi

echo "==> [3/7] Serverless VPC Access 커넥터 생성 (Cloud Run ↔ GCE 내부망 연계)..."
if ! gcloud compute networks vpc-access connectors describe "$CONNECTOR_NAME" --region="$REGION" &>/dev/null; then
  gcloud compute networks vpc-access connectors create "$CONNECTOR_NAME" \
    --region="$REGION" \
    --network="$VPC_NAME" \
    --range="10.10.3.0/28" \
    --min-instances=2 \
    --max-instances=3
fi

echo "==> [4/7] MongoDB 보안 방화벽 규칙 생성 (사설 서브넷에서만 27017 접근 허용)..."
if ! gcloud compute firewall-rules describe "allow-mongodb-from-connector" &>/dev/null; then
  gcloud compute firewall-rules create "allow-mongodb-from-connector" \
    --network="$VPC_NAME" \
    --allow=tcp:27017 \
    --source-ranges="10.10.3.0/28,10.10.2.0/24" \
    --target-tags="mongodb-server" \
    --description="Allow Cloud Run VPC connector to reach MongoDB"
fi

echo "==> [5/7] 자체 운영 MongoDB GCE VM 생성 (공인 IP 미할당 - No Public IP)..."
if ! gcloud compute instances describe "$VM_NAME" --zone="${REGION}-a" &>/dev/null; then
  gcloud compute instances create "$VM_NAME" \
    --zone="${REGION}-a" \
    --machine-type="e2-standard-2" \
    --subnet="$SUBNET_DB" \
    --no-address \
    --tags="mongodb-server" \
    --image-family="ubuntu-2404-lts-amd64" \
    --image-project="ubuntu-os-cloud" \
    --boot-disk-size="30GB" \
    --create-disk="name=${VM_NAME}-data,size=50GB,type=pd-balanced,auto-delete=no"
fi

echo "==> [6/7] Cloud Run 배포를 위한 Secret Manager 등록 안내..."
echo "  MONGODB_URI 및 SESSION_SECRET 을 Secret Manager 에 안전하게 등록하세요."

echo "==> [7/7] Cloud Run 컨테이너 서비스 배포 명령 예시..."
cat << 'EOF'
gcloud run deploy smart-industry-web \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --cpu 1 \
  --memory 1Gi \
  --vpc-connector smart-industry-connector \
  --vpc-egress private-ranges-only \
  --set-secrets="MONGODB_URI=smart-industry-db-uri:latest,SESSION_SECRET=smart-industry-session-secret:latest"
EOF

echo "=============================================================================="
echo "GCP 인프라 프로비저닝 스크립트 준비 완료."
echo "=============================================================================="

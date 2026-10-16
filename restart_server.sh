#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 포털 — 서비스 재시작 스크립트 (run_port.sh 안전 위임)
#
# [사용법]
#   ./restart_server.sh                 (기본: 개발 모드 30013 재시작)
#   ./restart_server.sh dev [PORT]      (개발 모드 지정 포트 재시작)
#   ./restart_server.sh prod [PORT]     (운영 모드 지정 포트 재시작, any port 대응)
#   ./restart_server.sh [PORT]          (운영 모드로 해당 포트 재시작)
#   ./restart_server.sh status [PORT]   (지정 포트 상태 점검)
#
# ※ exec를 제거하고, source / 직접 실행 모두에서 터미널이 닫히지 않도록 보호합니다.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARG1="${1:-dev}"
ARG2="${2:-}"

if [[ "$ARG1" =~ ^[0-9]+$ ]]; then
  bash "${PROJECT_DIR}/run_port.sh" restart prod "$ARG1"
elif [ "$ARG1" = "status" ]; then
  bash "${PROJECT_DIR}/run_port.sh" status "$ARG2"
elif [ "$ARG1" = "prod" ] || [ "$ARG1" = "start" ]; then
  bash "${PROJECT_DIR}/run_port.sh" restart prod "$ARG2"
else
  bash "${PROJECT_DIR}/run_port.sh" restart dev "$ARG2"
fi
EXIT_CODE=$?

if (return 0 2>/dev/null); then
  return $EXIT_CODE 2>/dev/null || true
else
  exit $EXIT_CODE
fi
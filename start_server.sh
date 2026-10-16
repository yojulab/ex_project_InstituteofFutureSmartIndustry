#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 포털 — 서비스 기동 스크립트 (run_port.sh 안전 위임)
#
# [사용법]
#   ./start_server.sh          (기본: 개발 모드 Port 30013 기동)
#   ./start_server.sh dev      (개발 모드 Port 30013 기동)
#   ./start_server.sh prod     (운영 모드 Port 30013 기동)
#   ./start_server.sh debug    (디버그 모드 Port 30013 + 인스펙터 30014)
#   ./start_server.sh status   (Port 30013 상태 점검)
#
# ※ exec를 제거하고, source / 직접 실행 모두에서 터미널이 닫히지 않도록 보호합니다.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARG="${1:-dev}"

# 모드 매핑 및 run_port.sh 위임
case "$ARG" in
  status)
    bash "${PROJECT_DIR}/run_port.sh" status
    ;;
  debug|dev:debug)
    bash "${PROJECT_DIR}/run_port.sh" debug
    ;;
  prod|start)
    bash "${PROJECT_DIR}/run_port.sh" start
    ;;
  dev|all|"")
    bash "${PROJECT_DIR}/run_port.sh" dev
    ;;
  *)
    bash "${PROJECT_DIR}/run_port.sh" "$ARG"
    ;;
esac
EXIT_CODE=$?

# source(.)로 실행된 경우 exit를 호출하면 터미널 창이 닫히므로 return 처리
if (return 0 2>/dev/null); then
  return $EXIT_CODE 2>/dev/null || true
else
  exit $EXIT_CODE
fi

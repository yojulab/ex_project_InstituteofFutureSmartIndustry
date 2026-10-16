#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 포털 — 서비스 기동 스크립트 (run_port.sh 안전 위임)
#
# [특징]
#   - Any Host 바인딩: 0.0.0.0 바인딩을 통해 외부 접속 지원
#   - Any Port 지원: 기본 포트(30013) 외에 임의의 포트(any port) 지정 실행 지원
#
# [사용법]
#   ./start_server.sh                  (기본: 개발 모드 Port 30013 기동)
#   ./start_server.sh prod             (운영 모드 Port 30013 기동)
#   ./start_server.sh prod [PORT]      (운영 모드 임의 포트 기동, 예: ./start_server.sh prod 8080)
#   ./start_server.sh [PORT]           (임의 포트 지정 시 운영 모드로 즉시 기동)
#   ./start_server.sh dev [PORT]       (개발 모드 기동)
#   ./start_server.sh debug [PORT]     (디버그 모드 + 인스펙터 30014)
#   ./start_server.sh status [PORT]    (지정 포트 상태 점검)
#
# ※ exec를 제거하고, source / 직접 실행 모두에서 터미널이 닫히지 않도록 보호합니다.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARG1="${1:-dev}"
ARG2="${2:-}"

# 첫 번째 인자가 숫자인 경우 (예: ./start_server.sh 8080) -> 운영 모드로 해당 포트 실행
if [[ "$ARG1" =~ ^[0-9]+$ ]]; then
  bash "${PROJECT_DIR}/run_port.sh" start "$ARG1"
else
  case "$ARG1" in
    status)
      bash "${PROJECT_DIR}/run_port.sh" status "$ARG2"
      ;;
    debug|dev:debug)
      bash "${PROJECT_DIR}/run_port.sh" debug "$ARG2"
      ;;
    prod|start)
      bash "${PROJECT_DIR}/run_port.sh" start "$ARG2"
      ;;
    dev|all|"")
      bash "${PROJECT_DIR}/run_port.sh" dev "$ARG2"
      ;;
    *)
      bash "${PROJECT_DIR}/run_port.sh" "$ARG1" "$ARG2"
      ;;
  esac
fi
EXIT_CODE=$?

# source(.)로 실행된 경우 exit를 호출하면 터미널 창이 닫히므로 return 처리
if (return 0 2>/dev/null); then
  return $EXIT_CODE 2>/dev/null || true
else
  exit $EXIT_CODE
fi

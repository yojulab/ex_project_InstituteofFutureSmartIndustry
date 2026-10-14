#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — 포트 30013 및 디버그 프로세스 관리 스크립트 (run_port.sh)
#
# [사용법]
#   ./run_port.sh dev              (포트 30013 개발 모드)
#   ./run_port.sh dev:debug        (포트 30013 + 인스펙터 30014 디버그 모드)
#   ./run_port.sh start (또는 prod) (포트 30013 프로덕션 운영 모드)
#   ./run_port.sh stop             (프로세스 중지)
#   ./run_port.sh restart          (재시작)
#   ./run_port.sh status           (30013 포트 상태 확인)
# ==============================================================================

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=30013
INSPECT_PORT=30014
LOG_FILE="${PROJECT_DIR}/server.log"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

is_port_in_use() {
  local p=$1
  if (bash -c "(echo > /dev/tcp/127.0.0.1/${p}) >/dev/null 2>&1" 2>/dev/null); then
    return 0
  fi
  return 1
}

get_pids() {
  pgrep -f "next.*(30013|dev|start)" 2>/dev/null || true
}

cmd_stop() {
  echo -n -e "🛑 [:${PORT}] 프로세스 중지 중... "
  local pids
  pids=$(get_pids)
  if [ -n "$pids" ]; then
    kill -15 $pids 2>/dev/null || true
    sleep 1
    local remain
    remain=$(get_pids)
    if [ -n "$remain" ]; then
      kill -9 $remain 2>/dev/null || true
    fi
    echo -e "${YELLOW}종료 완료 (PID: ${pids})${NC}"
  else
    echo -e "${NC}실행 중인 프로세스 없음${NC}"
  fi
}

cmd_start() {
  local mode=${1:-prod}
  cmd_stop >/dev/null 2>&1
  sleep 1

  echo -e "🚀 [:${PORT}] 미래스마트산업진흥원 포털 기동 중 (${mode} 모드)..."

  if [ "$mode" = "debug" ]; then
    nohup env NODE_OPTIONS="--inspect=0.0.0.0:${INSPECT_PORT}" npm run dev:30013 > "$LOG_FILE" 2>&1 &
  elif [ "$mode" = "dev" ]; then
    nohup npm run dev:30013 > "$LOG_FILE" 2>&1 &
  else
    nohup npm run start:30013 > "$LOG_FILE" 2>&1 &
  fi

  for i in {1..8}; do
    if is_port_in_use "$PORT"; then
      echo -e "   ${GREEN}✓ [:${PORT}] ONLINE 기동 성공 (URL: http://localhost:${PORT})${NC}"
      if [ "$mode" = "debug" ]; then
        echo -e "   ${CYAN}🔍 Node Debugger Inspector: ws://localhost:${INSPECT_PORT}${NC}"
      fi
      return 0
    fi
    sleep 1
  done

  echo -e "   ${YELLOW}⏳ 초기화 진행 중 (상태 확인: ./run_port.sh status)${NC}"
}

cmd_status() {
  echo -e "${CYAN}=================================================================${NC}"
  echo -e "${CYAN} 🏢 미래스마트산업진흥원 포털 서비스 상태 점검 (Port ${PORT})${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  if is_port_in_use "$PORT"; then
    local pids
    pids=$(get_pids)
    echo -e "  • [:${PORT}] 미래스마트산업진흥원 포털 : ${GREEN}ONLINE${NC} (PID: ${pids:-확인중}) ✓"
    echo -e "  • 접속 URL: ${BOLD}http://localhost:${PORT}${NC}"
  else
    echo -e "  • [:${PORT}] 미래스마트산업진흥원 포털 : ${RED}STOPPED${NC}"
  fi
  echo -e "${CYAN}=================================================================${NC}"
}

ACTION="${1:-status}"

case "$ACTION" in
  dev)
    cmd_start "dev"
    ;;
  dev:debug|debug)
    cmd_start "debug"
    ;;
  start|prod)
    cmd_start "prod"
    ;;
  stop)
    cmd_stop
    ;;
  restart)
    cmd_stop
    sleep 1
    cmd_start "dev"
    ;;
  status)
    cmd_status
    ;;
  *)
    echo "사용법: ./run_port.sh [dev | dev:debug | start | stop | restart | status]"
    exit 1
    ;;
esac

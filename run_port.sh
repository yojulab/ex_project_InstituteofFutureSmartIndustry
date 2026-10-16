#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — 포트 및 프로세스 생명주기 관리 스크립트 (run_port.sh)
#
# [특징]
#   - Any Host 바인딩: 0.0.0.0 바인딩으로 외부 어디서든 웹 접속 가능
#   - Any Port 지원: 기본 포트(30013) 외에 임의의 포트(any port) 지정 실행 지원
#   - 운영(prod) 모드: 사전 빌드(.next) 확인 후 npx next start -H 0.0.0.0 -p <PORT> 고속 서빙
#   - 개발(dev) 모드: npx next dev -H 0.0.0.0 -p <PORT>
#   - 디버그(debug) 모드: Node 인스펙터(30014) 연동
#
# [사용법]
#   ./run_port.sh start [PORT]          (운영 모드 기동, 기본 30013 또는 임의 포트)
#   ./run_port.sh prod [PORT]           (운영 모드 기동)
#   ./run_port.sh [PORT]                (임의 포트로 운영 모드 즉시 기동)
#   ./run_port.sh dev [PORT]            (개발 모드 기동)
#   ./run_port.sh dev:debug [PORT]      (개발+인스펙터 30014 디버그 모드)
#   ./run_port.sh stop [PORT]           (프로세스 중지)
#   ./run_port.sh restart [dev|prod] [PORT] (재시작)
#   ./run_port.sh status [PORT]         (지정 포트 서비스 상태 확인)
# ==============================================================================

# source(.)로 호출되었을 때 터미널 강제 종료 및 환경 오염 방지
(return 0 2>/dev/null) && _RUN_PORT_SOURCED=1 || _RUN_PORT_SOURCED=0

safe_exit() {
  local code=${1:-0}
  if [ "$_RUN_PORT_SOURCED" -eq 1 ]; then
    return "$code" 2>/dev/null || true
  else
    exit "$code"
  fi
}

if [ "$_RUN_PORT_SOURCED" -eq 0 ]; then
  set -uo pipefail
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_PORT=30013
DEFAULT_HOST="0.0.0.0"
INSPECT_PORT="${INSPECT_PORT:-30014}"
LOG_FILE="${PROJECT_DIR}/server.log"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# 인자 해석
ACTION="${1:-status}"
ARG2="${2:-}"
ARG3="${3:-}"

# 첫 번째 인자가 포트 번호인 경우 (예: ./run_port.sh 8080)
if [[ "$ACTION" =~ ^[0-9]+$ ]]; then
  PORT="$ACTION"
  ACTION="start"
  TARGET_MODE="prod"
else
  # 2번째 또는 3번째 인자에서 포트 추출
  if [[ "$ARG2" =~ ^[0-9]+$ ]]; then
    PORT="$ARG2"
    TARGET_MODE=""
  elif [[ "$ARG3" =~ ^[0-9]+$ ]]; then
    PORT="$ARG3"
    TARGET_MODE="$ARG2"
  else
    PORT="${PORT:-$DEFAULT_PORT}"
    TARGET_MODE="$ARG2"
  fi
fi

PORT="${PORT:-$DEFAULT_PORT}"

check_socket_open() {
  local host="${1:-127.0.0.1}"
  local p="$2"
  python3 -c "import socket; s = socket.socket(); s.settimeout(0.5); s.connect(('${host}', ${p})); s.close()" 2>/dev/null
}

is_port_in_use() {
  local p=$1
  local host="${2:-127.0.0.1}"
  check_socket_open "$host" "$p"
}

get_pids() {
  local p=${1:-$PORT}
  local pids
  pids=$(fuser "${p}/tcp" 2>/dev/null | tr -s ' ' '\n' | grep -v '^$' || true)
  if [ -n "$pids" ]; then
    echo "$pids" | tr '\n' ' ' | sed 's/[[:space:]]*$//'
    return
  fi
  pgrep -f "next.*(${p}|dev|start|server)" 2>/dev/null || true
}

cmd_stop() {
  local p=${1:-$PORT}
  echo -n -e "🛑 [:${p}] 프로세스 중지 중... "
  local pids
  pids=$(get_pids "$p")
  if [ -n "$pids" ]; then
    kill -15 $pids 2>/dev/null || true
    sleep 1
    local remain
    remain=$(get_pids "$p")
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
  local p=${2:-$PORT}
  cmd_stop "$p" >/dev/null 2>&1
  sleep 1

  echo -e "🚀 [:${p}] 미래스마트산업진흥원 포털 기동 중 (${mode} 모드, Host: ${DEFAULT_HOST})..."

  # MongoDB 상태 점검
  local env_file="${PROJECT_DIR}/.env"
  local db_uri=""
  if [ -f "$env_file" ]; then
    db_uri=$(grep -E '^[[:space:]]*MONGODB_URI=' "$env_file" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  fi

  local db_host="127.0.0.1"
  local db_port="27017"
  if [ -n "$db_uri" ]; then
    local ext_host=$(echo "$db_uri" | sed -E 's|^mongodb://([^:/@]+@)?([^:/@]+)(:([0-9]+))?.*|\2|')
    local ext_port=$(echo "$db_uri" | sed -E 's|^mongodb://([^:/@]+@)?([^:/@]+)(:([0-9]+))?.*|\4|')
    [ -n "$ext_host" ] && db_host="$ext_host"
    [ -n "$ext_port" ] && db_port="$ext_port"
  fi

  # Docker 호스트 게이트웨이 탐색
  local gw_hex=$(awk '$2 == "00000000" {print $3}' /proc/net/route 2>/dev/null | head -n 1)
  local docker_gw=""
  if [ -n "$gw_hex" ] && [ ${#gw_hex} -eq 8 ]; then
    docker_gw=$(printf "%d.%d.%d.%d" "0x${gw_hex:6:2}" "0x${gw_hex:4:2}" "0x${gw_hex:2:2}" "0x${gw_hex:0:2}")
  fi

  local db_reachable=0
  if check_socket_open "$db_host" "$db_port"; then
    db_reachable=1
  elif [ -n "$docker_gw" ] && { [ "$db_host" = "127.0.0.1" ] || [ "$db_host" = "localhost" ]; }; then
    if check_socket_open "$docker_gw" "$db_port"; then
      db_reachable=1
      echo -e "   ${GREEN}✓ Docker 호스트 MongoDB 감지됨 (Host: ${docker_gw}:${db_port})${NC}"
    fi
  fi

  if [ "$db_reachable" -eq 0 ]; then
    if command -v mongod >/dev/null 2>&1; then
      echo -e "   ${YELLOW}⚡ MongoDB (${db_host}:${db_port}) 미가동 감지. 데몬 자동 기동 중...${NC}"
      mkdir -p /root/data/db
      mongod --dbpath /root/data/db --fork --logpath /root/data/mongod.log --bind_ip 127.0.0.1 >/dev/null 2>&1 || true
      sleep 1
    else
      echo -e "   ${YELLOW}⚠️ MongoDB (${db_host}:${db_port}) 미연결 (컨테이너 내 mongod 미설치. 외부/Docker MongoDB 확인 필요)${NC}"
    fi
  else
    echo -e "   ${GREEN}✓ MongoDB (${db_host}:${db_port}) 연결 확인 완료${NC}"
  fi

  if [ "$mode" = "debug" ]; then
    nohup env PORT="$p" HOSTNAME="$DEFAULT_HOST" NODE_OPTIONS="--inspect=0.0.0.0:${INSPECT_PORT}" npx next dev -H "$DEFAULT_HOST" -p "$p" > "$LOG_FILE" 2>&1 &
  elif [ "$mode" = "dev" ]; then
    nohup env PORT="$p" HOSTNAME="$DEFAULT_HOST" npx next dev -H "$DEFAULT_HOST" -p "$p" > "$LOG_FILE" 2>&1 &
  else
    # prod (운영 모드)
    if [ ! -f "${PROJECT_DIR}/.next/BUILD_ID" ]; then
      echo -e "   ${YELLOW}📦 프로덕션 빌드 부재 감지. next build 자동 실행 중...${NC}"
      (cd "$PROJECT_DIR" && npm run build)
    fi
    nohup env PORT="$p" HOSTNAME="$DEFAULT_HOST" npx next start -H "$DEFAULT_HOST" -p "$p" > "$LOG_FILE" 2>&1 &
  fi

  for i in {1..8}; do
    if is_port_in_use "$p"; then
      echo -e "   ${GREEN}✓ [:${p}] ONLINE 기동 성공 (URL: http://localhost:${p} 및 http://${DEFAULT_HOST}:${p})${NC}"
      echo -e "   ${CYAN}🌐 Any Host / Any Port 접속 지원: 외부 네트워크 및 지정 포트(:${p}) 바인딩 완료${NC}"
      if [ "$mode" = "debug" ]; then
        echo -e "   ${CYAN}🔍 Node Debugger Inspector: ws://localhost:${INSPECT_PORT}${NC}"
      fi
      return 0
    fi
    sleep 1
  done

  echo -e "   ${YELLOW}⏳ 초기화 진행 중 (상태 확인: ./run_port.sh status ${p})${NC}"
}

cmd_status() {
  local p=${1:-$PORT}
  echo -e "${CYAN}=================================================================${NC}"
  echo -e "${CYAN} 🏢 미래스마트산업진흥원 포털 서비스 상태 점검 (Port ${p})${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  if is_port_in_use "$p"; then
    local pids
    pids=$(get_pids "$p")
    echo -e "  • [:${p}] 미래스마트산업진흥원 포털 : ${GREEN}ONLINE${NC} (PID: ${pids:-확인중}) ✓"
    echo -e "  • 접속 URL: ${BOLD}http://localhost:${p}${NC} (외부: http://<서버IP>:${p})"
    echo -e "  • 바인딩 호스트: ${BOLD}${DEFAULT_HOST} (모든 네트워크 인터페이스 Any Host)${NC}"
  else
    echo -e "  • [:${p}] 미래스마트산업진흥원 포털 : ${RED}STOPPED${NC}"
  fi
  echo -e "${CYAN}=================================================================${NC}"
}

case "$ACTION" in
  dev)
    cmd_start "dev" "$PORT"
    ;;
  dev:debug|debug)
    cmd_start "debug" "$PORT"
    ;;
  start|prod|all)
    if [ "$TARGET_MODE" = "dev" ] || [ "$TARGET_MODE" = "debug" ]; then
      cmd_start "$TARGET_MODE" "$PORT"
    else
      cmd_start "prod" "$PORT"
    fi
    ;;
  stop)
    cmd_stop "$PORT"
    ;;
  restart)
    cmd_stop "$PORT"
    sleep 1
    if [ "$TARGET_MODE" = "prod" ] || [ "$TARGET_MODE" = "start" ]; then
      cmd_start "prod" "$PORT"
    elif [ "$TARGET_MODE" = "debug" ] || [ "$TARGET_MODE" = "dev:debug" ]; then
      cmd_start "debug" "$PORT"
    else
      cmd_start "prod" "$PORT"
    fi
    ;;
  status)
    cmd_status "$PORT"
    ;;
  *)
    echo "사용법: ./run_port.sh [start|prod|dev|debug|stop|restart|status] [PORT]"
    echo "       또는 ./run_port.sh [PORT] (임의 포트로 운영 기동)"
    safe_exit 1
    ;;
esac

safe_exit 0

#!/usr/bin/env bash
# ==============================================================================
# 미래스마트산업진흥원 — 포털 및 관리자 CMS 컴파일 & 빌드 매니저 (compile.sh)
#
# [주요 기능]
#   • Next.js 프로덕션 번들 빌드 (next build - Turbopack 최적화)
#   • On-Device 의미 검색용 인덱스 빌드 (public/search-index.json)
#   • TypeScript 정적 타입 검사 (npx tsc --noEmit)
#   • 빌드 캐시(.next, tsconfig.tsbuildinfo) 정리 및 클린 빌드
#   • 컴파일 완료 후 운영(prod) 서버 즉시 기동 연계
#
# [사용법]
#   ./compile.sh               -> 전체 컴파일 (Next.js + 온디바이스 검색 인덱스)
#   ./compile.sh all           -> 전체 컴파일
#   ./compile.sh next          -> Next.js 앱 빌드만 수행
#   ./compile.sh search        -> On-Device 검색 인덱스만 재구축
#   ./compile.sh tsc           -> TypeScript 정적 타입 검사만 수행
#   ./compile.sh clean         -> 빌드 산출물 및 캐시 정리
#   ./compile.sh clean-build   -> 캐시 정리 후 전체 클린 재컴파일
#   ./compile.sh check         -> 타입 검사 + 전체 컴파일
#   ./compile.sh start [PORT]  -> 전체 컴파일 후 운영 모드로 서버 즉시 기동
# ==============================================================================

# source(.)로 호출되었는지 검사하여 터미널 강제 종료 방지
(return 0 2>/dev/null) && _COMPILE_SOURCED=1 || _COMPILE_SOURCED=0

safe_exit() {
  local code=${1:-0}
  if [ "$_COMPILE_SOURCED" -eq 1 ]; then
    return "$code" 2>/dev/null || true
  else
    exit "$code"
  fi
}

if [ "$_COMPILE_SOURCED" -eq 0 ]; then
  set -uo pipefail
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_PORT="${PORT:-30013}"

# 터미널 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# 의존성 모듈 설치 여부 확인
ensure_dependencies() {
  if [ ! -d "${PROJECT_DIR}/node_modules" ]; then
    echo -e "${YELLOW}⚠️ node_modules 미설치 감지 → npm install 진행...${NC}"
    (cd "${PROJECT_DIR}" && npm install) || {
      echo -e "${RED}✗ 의존성 패키지 설치에 실패했습니다.${NC}"
      return 1
    }
  fi
  return 0
}

# 1. Next.js 프로덕션 빌드
build_next_app() {
  echo -e "\n${CYAN}=================================================================${NC}"
  echo -e " 🚀 ${BOLD}Next.js 포털 & CMS 프로덕션 번들 빌드 시작 (npm run build)${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  ensure_dependencies || return 1

  local start_time=$(date +%s)
  if (cd "${PROJECT_DIR}" && npm run build); then
    local end_time=$(date +%s)
    local elapsed=$((end_time - start_time))
    local build_id=$(cat "${PROJECT_DIR}/.next/BUILD_ID" 2>/dev/null || echo "ok")
    echo -e "${GREEN}✓ Next.js 빌드 성공! (BUILD_ID: ${build_id}, 소요 시간: ${elapsed}초)${NC}"
    return 0
  else
    echo -e "${RED}✗ Next.js 빌드 실패! 로그를 확인해 주십시오.${NC}"
    return 1
  fi
}

# 2. 온디바이스 검색 인덱스 빌드
build_search_index() {
  echo -e "\n${CYAN}=================================================================${NC}"
  echo -e " 🔍 ${BOLD}On-Device 의미 검색 인덱스 빌드 (npm run build:search)${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  if (cd "${PROJECT_DIR}" && npm run build:search); then
    local index_file="${PROJECT_DIR}/public/search-index.json"
    local size=$(stat -c%s "$index_file" 2>/dev/null || stat -f%z "$index_file" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓ 검색 인덱스 빌드 완료! (파일: public/search-index.json, 크기: ${size} bytes)${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️ 검색 인덱스 생성 중 오류가 발생했거나 스킵되었습니다.${NC}"
    return 1
  fi
}

# 3. TypeScript 타입 검증
run_typecheck() {
  echo -e "\n${CYAN}=================================================================${NC}"
  echo -e " 🛡️ ${BOLD}TypeScript 정적 타입 검증 (npx tsc --noEmit)${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  if (cd "${PROJECT_DIR}" && npx tsc --noEmit); then
    echo -e "${GREEN}✓ TypeScript 타입 검증 통과 (에러 0건)${NC}"
    return 0
  else
    echo -e "${RED}✗ TypeScript 타입 에러가 감지되었습니다.${NC}"
    return 1
  fi
}

# 4. 빌드 캐시 클린
cmd_clean() {
  echo -e "\n${YELLOW}🧹 빌드 캐시 및 임시 파일 정리 중...${NC}"
  rm -rf "${PROJECT_DIR}/.next"
  rm -f "${PROJECT_DIR}/tsconfig.tsbuildinfo"
  rm -f "${PROJECT_DIR}/server.log"
  echo -e "${GREEN}✓ .next 및 tsbuildinfo 캐시가 깨끗이 삭제되었습니다.${NC}\n"
}

# 5. 전체 컴파일
cmd_compile_all() {
  echo -e "${CYAN}=================================================================${NC}"
  echo -e "${CYAN} 📦 미래스마트산업진흥원 포털 전체 컴파일 매니저 (compile.sh)${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  local total_start=$(date +%s)

  # [1/2] Next.js 프로덕션 빌드
  if ! build_next_app; then
    echo -e "\n${RED}❌ 전체 컴파일 실패: Next.js 빌드 단계에서 오류가 발생했습니다.${NC}"
    safe_exit 1
  fi

  # [2/2] 온디바이스 검색 인덱스 빌드
  if ! build_search_index; then
    echo -e "\n${YELLOW}⚠️ 경고: 검색 인덱스 빌드가 실패했으나 Next.js 앱 빌드는 완료되었습니다.${NC}"
  fi

  local total_end=$(date +%s)
  local total_elapsed=$((total_end - total_start))

  echo -e "\n${GREEN}=================================================================${NC}"
  echo -e "${GREEN} 🎉 전체 컴파일 성공 완료! (총 소요 시간: ${total_elapsed}초)${NC}"
  echo -e "${GREEN}=================================================================${NC}"
  echo -e " 💡 ${BOLD}서비스 기동 안내:${NC}"
  echo -e "   • 운영 모드 기동 : ${BOLD}./start_server.sh prod${NC}  (또는 ./run_port.sh start)"
  echo -e "   • 임의 포트 기동 : ${BOLD}./start_server.sh prod 8080${NC} (Any Port 지원)"
  echo -e "   • 개발 모드 기동 : ${BOLD}./start_server.sh dev${NC}"
  echo -e "${GREEN}=================================================================${NC}\n"
}

# ------------------------------------------------------------------------------
# 메인 CLI 라우팅
# ------------------------------------------------------------------------------
ACTION="${1:-all}"
OPT_ARG="${2:-}"

case "$ACTION" in
  all|build|compile|"")
    cmd_compile_all
    safe_exit $?
    ;;
  next|app)
    build_next_app
    safe_exit $?
    ;;
  search|index)
    build_search_index
    safe_exit $?
    ;;
  tsc|typecheck)
    run_typecheck
    safe_exit $?
    ;;
  clean)
    cmd_clean
    safe_exit 0
    ;;
  clean-build|clean_build)
    cmd_clean
    cmd_compile_all
    safe_exit $?
    ;;
  check)
    run_typecheck || safe_exit 1
    cmd_compile_all
    safe_exit $?
    ;;
  start|prod|run)
    cmd_compile_all
    local target_port="${OPT_ARG:-$DEFAULT_PORT}"
    echo -e "🚀 컴파일 완료에 따라 [Port ${target_port}] 운영 모드로 자동 기동합니다..."
    bash "${PROJECT_DIR}/start_server.sh" prod "$target_port"
    safe_exit $?
    ;;
  help|--help|-h)
    echo -e "${CYAN}=================================================================${NC}"
    echo -e "${CYAN} 🏢 미래스마트산업진흥원 compile.sh 사용법${NC}"
    echo -e "${CYAN}=================================================================${NC}"
    echo -e "  • ${BOLD}./compile.sh${NC}              : 전체 컴파일 (Next.js + 검색 인덱스)"
    echo -e "  • ${BOLD}./compile.sh all${NC}          : 전체 컴파일 (동일)"
    echo -e "  • ${BOLD}./compile.sh next${NC}         : Next.js 프로덕션 앱 빌드만 수행"
    echo -e "  • ${BOLD}./compile.sh search${NC}       : On-Device 검색 인덱스(search-index.json)만 재구축"
    echo -e "  • ${BOLD}./compile.sh tsc${NC}          : TypeScript 정적 타입 검증 (tsc --noEmit)"
    echo -e "  • ${BOLD}./compile.sh clean${NC}        : 빌드 캐시(.next, tsbuildinfo) 정리"
    echo -e "  • ${BOLD}./compile.sh clean-build${NC}  : 캐시 정리 후 전체 클린 재컴파일"
    echo -e "  • ${BOLD}./compile.sh check${NC}        : 타입 검증 + 전체 컴파일"
    echo -e "  • ${BOLD}./compile.sh start [PORT]${NC} : 컴파일 완료 후 지정 포트로 운영 즉시 기동"
    echo -e "${CYAN}=================================================================${NC}"
    safe_exit 0
    ;;
  *)
    echo -e "${RED}알 수 없는 명령어: ${ACTION}${NC}"
    echo -e "사용법: ./compile.sh [all|next|search|tsc|clean|clean-build|check|start [PORT]|help]"
    safe_exit 1
    ;;
esac

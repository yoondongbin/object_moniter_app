#!/bin/bash
# Jenkins iOS 빌드 요청 감시 스크립트
# Jenkins에서 생성한 iOS 빌드 요청을 감시하고 자동으로 빌드 실행
# 백그라운드 데몬으로 실행되며 파일 기반으로 Jenkins와 통신

set -e # 오류 발생 시 스크립트 즉시 중단

# 감시 스크립트 설정 변수
WATCH_DIR="/tmp/jenkins-ios-builds"     # Jenkins 빌드 요청 감시 디렉터리
MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"      # 모바일 프로젝트 디렉터리 (자동 감지)
CHECK_INTERVAL=10      # 감시 간격 (초)
MAX_CONCURRENT_BUILDS=1     # 동시 빌드 최대 개수
LOG_RETENTION_DAYS=7        # 로그 보관 기간(일)

# 터미널 출력 색상 정의
RED='\033[0;31m'      # 오류 메시지
GREEN='\033[0;32m'    # 성공 메시지
YELLOW='\033[1;33m'   # 경고 메시지
BLUE='\033[0;34m'     # 정보 메시지
PURPLE='\033[0;35m'   # 빌드 진행 메시지
CYAN='\033[0;36m'     # 헤더 메시지
NC='\033[0m'          # 색상 초기화

# 로그 출력 함수 정의 (타임스탬프 포함)
log_info() { echo -e "${BLUE}ℹ️  $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_error() { echo -e "${RED}❌ $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_build() { echo -e "${PURPLE}🔨 $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"; }
log_watch() { echo -e "${CYAN}👀 $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"; }

# 감시 스크립트 시작 헤더
echo -e "${CYAN}"
echo "=================================================="
echo " iOS 빌드 감시 스크립트 시작"
echo "=================================================="
echo -e "${NC}"

log_info "감시 스크립트 설정:"
echo "   - 감시 디렉터리: $WATCH_DIR"
echo "   - 모바일 프로젝트: $MOBILE_DIR"
echo "   - 감시 간격: ${CHECK_INTERVAL}초"
echo "   - 최대 동시 빌드: $MAX_CONCURRENT_BUILDS"
echo "   - 로그 보관 기간: ${LOG_RETENTION_DAYS}일"
echo "   - 시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# macOS 환경 확인 (iOS 빌드는 macOS에서만 가능)
if [ "$(uname)" != "Darwin" ]; then
    log_error "iOS 빌드는 macOS에서만 가능합니다."
    log_error "현재 OS: $(uname)"
    exit 1
fi

# 필수 도구 확인 함수
check_requirements() {
    log_info "필수 도구 확인 중..."

    local missing_tools=() # 누락된 도구 목록 배열

    # Xcode 설치 확인
    if ! command -v xcodebuild >/dev/null 2>&1; then
        missing_tools+=("Xcode")
    fi
    
    # Node.js 설치 확인
    if ! command -v node >/dev/null 2>&1; then
        missing_tools+=("Node.js")
    fi

    # npx 설치 확인
    if ! command -v npx >/dev/null 2>&1; then
        missing_tools+=("npx")
    fi

    # 누락된 도구가 있으면 오류 출력 후 종료 (배열 문법 수정)
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "다음 도구들이 설치되지 않았습니다:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        echo ""
        log_warning "설치 방법:"
        echo "   - Xcode: App Store에서 설치"
        echo "   - Node.js: https://nodejs.org에서 설치"
        exit 1
    fi

    log_success "필수 도구 확인 완료"
}

# 감시 디렉터리 설정 함수
setup_watch_directory() {
    log_info "감시 디렉터리 설정 중..."

    # 필요한 디렉터리들 생성
    mkdir -p "$WATCH_DIR"   # 빌드 요청 파일 디렉터리
    mkdir -p "$WATCH_DIR/processed" # 처리 완료된 요청 파일 보관
    mkdir -p "$WATCH_DIR/failed"  # 실패한 요청 파일 보관
    mkdir -p "/tmp/jenkins-ios-artifacts"   # Jenkins 아티팩트 디렉터리

    # 기존 처리 중인 빌드 정리 (스크립트 재시작 시)
    rm -f "$WATCH_DIR"/*.lock 2>/dev/null || true

    # 오래된 로그 파일 정리 (보관 기간 초과)
    find "$WATCH_DIR" -name "*.json" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    find "$WATCH_DIR/processed" -name "*.json" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    find "$WATCH_DIR/failed" -name "*.json" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true

    log_success "감시 디렉터리 설정 완료"
}

# 현재 실행 중인 빌드 개수 확인 함수
get_running_builds_count() {
    # .lock 파일의 개수를 세어 현재 실행 중인 빌드 개수 반환
    find "$WATCH_DIR" -name "*.lock" 2>/dev/null | wc -l | tr -d ' '
}

# 빌드 요청 처리 함수
process_build_request() {
    local request_file=$1   #처리할 빌드 요청 파일
    local build_number=$2   #빌드 번호
    local environment       # 빌드 환경
    local timestamp         # 요청 시간

    log_build "빌드 요청 처리 시간: $(basename "$request_file")"

    # 동시 빌드 방지를 위한 락 파일 생성
    local lock_file="${request_file}.lock"
    if [ -f "$lock_file" ]; then
        log_warning "이미 처리 중인 빌드: $(basename "$request_file")"
        return 0
    fi

    # 락 파일 생성 (빌드 시작 표시)
    touch "$lock_file"

    # json 파일에서 빌드 정보 파싱
    # 빌드 번호 추출
    if ! build_number=$(grep '"buildNumber"' "$request_file" | cut -d'"' -f4 2>/dev/null); then
        log_error "빌드 번호 파싱 실패"
        rm -f "$lock_file"
        return 1
    fi

    # 환경 정보 추출
    if ! environment=$(grep '"environment"' "$request_file" | cut -d '"' -f4 2>/dev/null); then
        log_error "환경 정보 파싱 실패"
        rm -f "$lock_file"
        return 1
    fi

    # 타임스탬프 추출
    timestamp=$(grep '"timestamp"' "$request_file" | cut -d '"' -f4 2>/dev/null || echo "unknown")

    # 파싱된 정보 출력
    log_build "📋 빌드 정보:"
    log_build "   - 빌드 번호: $build_number"
    log_build "   - 환경: $environment"
    log_build "   - 요청 시간: $timestamp"

    # 모바일 프로젝트 디렉터리로 이동
    if ! cd "$MOBILE_DIR"; then
        log_error "모바일 프로젝트 디렉터리로 이동 실패: $MOBILE_DIR"
        rm -f "$lock_file"
        return 1
    fi

    # ios 빌드 실행 (jenkins 연동 스크립트 호출)
    log_build "ios 빌드 실행 중..."

    # jenkins 연동 빌드 스크립트 실행
    if ./scripts/build-ios-jenkins.sh "$environment" "$build_number"; then
        log_success "iOS 빌드 성공 (빌드 #$build_number)"

        # 성공 상태 업데이트 (json 파일 수정)
        if command -v sed >/dev/null 2>&1; then
            # macOS의 sed 사용 (백업 파일 생성 안함)
            sed -i '' 's/"requested"/"completed"/' "$request_file" 2>/dev/null || \
            # Linux의 sed 사용
            sed -i 's/"requested"/"completed"/' "$request_file" 2>/dev/null || true
        fi

        # 처리 완료된 요청 파일을 processed 디렉터리로 이동
        mv "$request_file" "$WATCH_DIR/processed/completed-$(basename "$request_file")" 2>/dev/null || true

    else
        log_error "iOS 빌드 실패 (빌드 #$build_number)"

        # 실패 상태 업데이트 (json 파일 수정)
        if command -v sed >/dev/null 2>&1; then
            # macOS의 sed 사용 (백업 파일 생성 안함)
            sed -i '' 's/"requested"/"failed"/' "$request_file" 2>/dev/null || \
            # Linux의 sed 사용
            sed -i 's/"requested"/"failed"/' "$request_file" 2>/dev/null || true
        fi

        # 실패한 요청 파일을 failed 디렉터리로 이동
        mv "$request_file" "$WATCH_DIR/failed/failed-$(basename "$request_file")" 2>/dev/null || true

    fi
    # 락 파일 제거(빌드 완료 표시)
    rm -f "$lock_file"

    log_build "빌드 요청 처리 완료: $(basename "$request_file")"
}

# 정리 함수 (스크립트 종료 시 호출)
cleanup() {
    log_info "감시 스크립트 종료 중..."

    # 모든 락 파일 제거 (진행 중인 빌드 정리)
    rm -f "$WATCH_DIR"/*.lock 2>/dev/null || true
    
    log_success "정리 완료"
    exit 0
}

# 신호 처리 (Ctrl+C 또는 종료 신호 시 정리 함수 호출)
trap cleanup SIGINT SIGTERM

# 메인 감시 루프 함수
main_watch_loop() {
    log_watch "메인 감시 루프 시작...."

    local loop_count=0  #루프 실행 횟수 카운터

    # 무한 루프로 빌드 요청 감시
    while true; do
        loop_count=$((loop_count + 1))

        # 주기적으로 상태 출력 (매 10회마다)
        if [ $((loop_count % 10)) -eq 0 ]; then
            log_watch "감시 중...(루피 #$loop_count)"
        fi

        # 현재 실행 중인 빌드 개수 확인
        running_builds=$(get_running_builds_count)

        # 최대 동시 빌드 개수 확인
        if [ "$running_builds" -ge "$MAX_CONCURRENT_BUILDS" ]; then
            log_warning "최대 동시 빌드 개수 도달 ($running_builds/$MAX_CONCURRENT_BUILDS)"
            sleep "$CHECK_INTERVAL"
            continue
        fi

        # 새로운 빌드 요청 파일 검색 (.json 파일 중 .lock이 없는 것)
        for request_file in "$WATCH_DIR"/*.json; do
            # 파일이 실제로 존재하는지 확인(glob 패턴이 매치되지 않을 경우 대비)
            if [ ! -f "$request_file" ]; then
                continue
            fi

            # 이미 처리 중인 파일인지 확인 (.lock 파일 존재 여부)
            if [ -f "${request_file}.lock" ]; then
                continue
            fi

            # 빌드 요청 처리
            log_watch "새로운 빌드 요청 발견: $(basename "$request_file")"
            process_build_request "$request_file" & # 백그라운드에서 실행

            # 동시 빌드 제한 확인
            running_builds=$((running_builds + 1))
            if [ "$running_builds" -ge "$MAX_CONCURRENT_BUILDS" ]; then
                break
            fi
        done

        # 다음 검사까지 대기
        sleep "$CHECK_INTERVAL"
    done
}
# 스크립트 실행 시작
log_info "iOS 빌드 감시 스크립트 초기화 중..."

# 필수 도구 확인
check_requirements

# 감시 디렉터리 설정
setup_watch_directory

# 메인 감시 루프 시작
main_watch_loop

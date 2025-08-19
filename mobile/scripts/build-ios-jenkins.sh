#!/bin/bash
# Jenkins CI/CD용 iOS 빌드 스크립트
# Jenkins 파이프라인에서 자동으로 실행되며 빌드 상태를 파일로 관리

set -e # 오류 발생 시 스크립트 즉시 중단

# Jenkins 빌드 파라미터 설정
MODE=${1:-staging}      # 빌드 환경 (staging/production)
BUILD_NUMBER=${2:-$(date +%Y%m%d-%H%M%S)}       # Jenkins 빌드 번호
JENKINS_URL=${3:-"http://localhost:8080"}       # Jenkins 서버 URL
JOB_NAME=${4:-"object-monitor-pipeline"}        # Jenkins Job 이름

# 터미널 출력 색상 정의
RED='\033[0;31m'      # 오류 메시지
GREEN='\033[0;32m'    # 성공 메시지
YELLOW='\033[1;33m'   # 경고 메시지
BLUE='\033[0;34m'     # 정보 메시지
PURPLE='\033[0;35m'   # 빌드 진행 메시지
CYAN='\033[0;36m'     # 헤더 메시지
NC='\033[0m'          # 색상 초기화

# 로그 출력 함수 정의 (타임스탬프 포함)
log_info() { echo -e "${BLUE}ℹ️  $(date '+%H:%M:%S') - $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $(date '+%H:%M:%S') - $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $(date '+%H:%M:%S') - $1${NC}"; }
log_error() { echo -e "${RED}❌ $(date '+%H:%M:%S') - $1${NC}"; }
log_build() { echo -e "${PURPLE}🔨 $(date '+%H:%M:%S') - $1${NC}"; }

# Jenkins 빌드 시작 헤더
echo -e "${CYAN}"
echo "=================================================="
echo " iOS Jenkins 연동 빌드 스크립트"
echo "=================================================="
echo -e "${NC}"

log_info "Jenkins 빌드 설정:"
echo "      - 환경: $MODE"
echo "      - 빌드 번호: $BUILD_NUMBER"
echo "      - Jenkins URL: $JENKINS_URL"
echo "      - Job 이름: $JOB_NAME"
echo "      - 시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# macOS 환경 확인
if [ "$(uname)" != "Darwin" ]; then
    log_error "iOS 빌드는 macOS에서만 가능합니다."
    log_error "현재 OS: $(uname)"
    log_warning "해결방법: macOS 환경에서 실행하세요"
    exit 1
fi

# 필수 도구 설치 확인
log_info "필수 도구 확인 중..."
missing_tools=() # 누락된 도구 목록 배열


# Xcode 설치 확인
if ! command -v xcodebuild >/dev/null 2>&1; then
    missing_tools+=("Xcode")
fi

# Node.js 설치 확인
if ! command -v npx >/dev/null 2>&1; then
    missing_tools+=("npx")
fi

# 누락된 도구가 있으면 오류 출력 후 종료
if [ ${#missing_tools[@]} -ne 0 ]; then
    log_error "다음 도구들이 설치되지 않았습니다:"
    for tool in "${missing_tools[@]}"; do
        echo "  - $tool"
    done
    echo ""
    log_warning "설치 방법:"
    echo "  - Xcode: App Store에서 설치"
    echo "  - Node.js: https://nodejs.org에서 설치"
    exit 1
fi

log_success "필수 도구 확인 완료"

# 환경 설정 파일 처리
ENV_FILE=".env.${MODE}" # 환경별 설정 파일 경로

# 환경 설정 파일 존재 확인
if [ ! -f "$ENV_FILE" ]; then
    log_error "환경 설정 파일이 없습니다: $ENV_FILE"
    log_warning "사용 가능한 환경 파일:"
    ls -la .env.* 2>/dev/null || echo "   환경 설정 파일이 없습니다."
    log_warning "해결방법: Jenkins에서 환경 파일을 생성했는지 확인하세요."
    exit 1
fi

# 환경 설정 파일을 현재 사용할 .env로 복사
log_info "환경 설정 적용: $ENV_FILE"
cp "$ENV_FILE" .env

# 적용된 환경 설정 내용 출력 (민감한 정보는 마스킹)
echo "📄 적용된 환경 설정:"
cat .env | sed 's/\(.*PASSWORD.*=\).*/\1***/' | sed 's/\(.*SECRET.*=\).*/\1***/'
echo ""

# CocoaPods 의존성 관리
log_build "CocoaPods 동기화 중..."
if ! npx pod-install ios; then
    log_error "CocoaPods 설치 실패!"
    log_warning "수동 설치를 시도하세요:"
    echo "   cd ios && pod install"
    log_warning "또는 CocoaPods 캐시를 정리하세요:"
    echo "   cd ios && pod deintegrate && pod install"
    
    # Jenkins 실패 상태 파일 생성
    create_jenkins_status_file "failed" "CocoaPods installation failed"
    exit 1
fi
log_success "CocoaPods 동기화 완료"

# Xcode 빌드 환경 준비
WORKSPACE="ios/mobile.xcworkspace" # Xcode 워크스페이스 파일
SCHEME="mobile" # Xcode 스킴명
BUILD_DIR="ios/build" # 빌드 결과 저장 디렉터리

# 기존 빌드 파일 정리 (클린 빌드 보장)
log_build "기존 빌드 파일 정리 중..."
rm -rf "$BUILD_DIR"
log_success "빌드 파일 정리 완료"

# Xcode 빌드 실행
log_build "Xcode 시뮬레이터용 Release 빌드 시작..."
log_info "빌드 설정:"
echo "   - 워크스페이스: $WORKSPACE"
echo "   - 스킴: $SCHEME"
echo "   - 구성: Release"
echo "   - SDK: iphonesimulator (시뮬레이터용)"
echo "   - 빌드 디렉터리: $BUILD_DIR"
echo ""

# Xcode 빌드 명령어 실행 (Jenkins 환경에서는 더 상세한 로그 출력)
if xcodebuild \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -sdk iphonesimulator \
    -derivedDataPath "$BUILD_DIR" \
    clean build | xcpretty || true; then
    log_success "Xcode 빌드 성공!"
else
    log_error "Xcode 빌드 실패!"
    log_warning "빌드 로그를 확인하세요."
    
    # Jenkins 실패 상태 파일 생성
    create_jenkins_status_file "failed" "Xcode build failed"
    exit 1
fi

# 빌드 결과 확인 및 처리
APP_PATH="$BUILD_DIR/Build/Products/Release-iphonesimulator/mobile.app"

# 앱 파일 존재 확인
if [ -d "$APP_PATH" ]; then
    log_success "iOS 앱 빌드 성공!"
    
    # 앱 정보 출력
    log_info "앱 정보:"
    echo "   - 경로: $APP_PATH"
    ls -la "$APP_PATH" | head -5  # 앱 내부 파일 일부 출력
    
    # 앱 크기 계산
    APP_SIZE=$(du -sh "$APP_PATH" | awk '{print $1}')
    echo "   - 크기: $APP_SIZE"
    
    # Jenkins용 앱 압축 및 아카이브 생성
    log_build "Jenkins용 앱 압축 중..."
    
    # 앱이 있는 디렉터리로 이동
    cd "$(dirname "$APP_PATH")"
    
    # Jenkins용 압축 파일명 생성 (환경-빌드번호.app.zip 형식)
    ZIP_NAME="mobile-${MODE}-${BUILD_NUMBER}.app.zip"
    
    # ZIP 압축 실행 (진행률 표시 없이)
    if zip -r "$ZIP_NAME" mobile.app >/dev/null 2>&1; then
        # 압축 파일 크기 계산
        ZIP_SIZE=$(du -sh "$ZIP_NAME" | awk '{print $1}')
        log_success "앱 압축 완료!"
        echo "   - 압축 파일: $ZIP_NAME"
        echo "   - 압축 크기: $ZIP_SIZE"
        
        # 압축 파일의 절대 경로 저장
        ZIP_FULL_PATH="$(pwd)/$ZIP_NAME"
        echo "   - 전체 경로: $ZIP_FULL_PATH"

        # Jenkins 아티팩트 디렉터리에 복사
        JENKINS_ARTIFACTS_DIR="/tmp/jenkins-ios-artifacts"
        mkdir -p "$JENKINS_ARTIFACTS_DIR"
        
        # 아티팩트 복사
        cp "$ZIP_NAME" "$JENKINS_ARTIFACTS_DIR/"
        log_success "Jenkins 아티팩트 디렉터리에 복사: $JENKINS_ARTIFACTS_DIR/$ZIP_NAME"
        
        # 아티팩트 권한 설정 (Jenkins가 읽을 수 있도록)
        chmod 644 "$JENKINS_ARTIFACTS_DIR/$ZIP_NAME"
        
    else
        log_error "앱 압축 실패!"
        create_jenkins_status_file "failed" "App compression failed"
        exit 1
    fi

    # Jenkins 빌드 완료 상태 파일 생성
    create_jenkins_status_file "completed" "Build successful" "$ZIP_FULL_PATH" "$APP_SIZE" "$ZIP_SIZE"

    # 빌드 완료 요약 출력
    echo ""
    echo -e "${GREEN}"
    echo "🎉 iOS Jenkins 빌드 완료!"
    echo "=================================================="
    echo "📋 빌드 결과 요약:"
    echo "   - 환경: $MODE"
    echo "   - 빌드 번호: $BUILD_NUMBER"
    echo "   - 앱 크기: $APP_SIZE"
    echo "   - 압축 크기: $ZIP_SIZE"
    echo "   - 아티팩트: $ZIP_FULL_PATH"
    echo "   - Jenkins 아티팩트: $JENKINS_ARTIFACTS_DIR/$ZIP_NAME"
    echo "   - 완료 시간: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo -e "${NC}"
    
    # Jenkins 연동 정보 출력
    log_info "Jenkins 연동 정보:"
    echo "   1. Jenkins에서 아티팩트 확인 가능"
    echo "   2. 빌드 상태 파일 생성됨"
    echo "   3. 시뮬레이터에서 앱 테스트 가능"
    echo "   4. 필요시 실기기 빌드 진행"
else
    # 빌드 실패 처리
    log_error "iOS 앱 빌드 실패!"
    log_warning "빌드 출력 디렉터리 확인:"
    find "$BUILD_DIR" -name "*.app" -type d 2>/dev/null || echo "   .app 파일을 찾을 수 없습니다."
    
    echo ""
    log_warning "문제 해결 방법:"
    echo "   1. Xcode에서 프로젝트를 열어 수동 빌드 시도"
    echo "   2. iOS 시뮬레이터가 설치되어 있는지 확인"
    echo "   3. 프로젝트 설정에서 Team과 Bundle Identifier 확인"
    echo "   4. CocoaPods 의존성 문제 확인: cd ios && pod install"
    echo "   5. Xcode Command Line Tools 확인: xcode-select --install"
    
    # Jenkins 실패 상태 파일 생성
    create_jenkins_status_file "failed" "iOS app build failed"
    exit 1
fi

# jenkins 상태 파일 생성 함수
# Jenkins가 빌드 결과를 확인할 수 있도록 JSON 형식의 상태 파일 생성
create_jenkins_status_file() {
    local status=$1        # 빌드 상태 (completed/failed)
    local message=$2       # 상태 메시지
    local artifact_path=${3:-""}  # 아티팩트 파일 경로
    local app_size=${4:-""}       # 앱 크기
    local zip_size=${5:-""}       # 압축 파일 크기

    # Jenkins 빌드 상태 디렉터리 생성
    BUILD_STATUS_DIR="/tmp/jenkins-ios-builds"
    mkdir -p "$BUILD_STATUS_DIR"

    # 상태 파일 경로 정의
    BUILD_STATUS_FILE="$BUILD_STATUS_DIR/build-status-${BUILD_NUMBER}.json"

    # 상태 파일 경로 정의
    BUILD_STATUS_FILE="$BUILD_STATUS_DIR/build-status-${BUILD_NUMBER}.json"

    # JSON 형식의 상태 파일 생성
    cat > "$BUILD_STATUS_FILE" << STATUSEOF
{
    "buildNumber": "$BUILD_NUMBER",
    "environment": "$MODE",
    "status": "$status",
    "message": "$message",
    "timestamp": "$(date -Iseconds)",
    "artifactPath": "$artifact_path",
    "appSize": "$app_size",
    "zipSize": "$zip_size",
    "jenkinsUrl": "$JENKINS_URL",
    "jobName": "$JOB_NAME",
    "macosHost": "$(hostname)",
    "xcodeVersion": "$(xcodebuild -version | head -1 || echo 'Unknown')",
    "nodeVersion": "$(node --version || echo 'Unknown')"
}
STATUSEOF
    
    log_success "Jenkins 상태 파일 생성: $BUILD_STATUS_FILE"
}

log_info "iOS Jenkins 빌드 스크립트 완료 - $(date '+%Y-%m-%d %H:%M:%S')"
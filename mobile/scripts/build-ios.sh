#!/bin/bash
# iOS 앱 로컬 빌드 스크립트
# 개발자가 직접 실행하여 iOS 앱을 빌드하고 테스트하는 용도

set -e # 오류 발생 시 스크립트 즉시 중단

# 빌드 파라미터 설정
MODE=${1:-staging}  # 빌드 환경 (기본값: staging)
BUILD_NUMBER=${2:-$(date +%Y%m%d-%H%M%S)} # 빌드 번호 (기본값: 현재 날짜시간)
SCHEME="mobile" # Xcode 프로젝트 스킴명
WORKSPACE="ios/mobile.xcworkspace" # Xcode 워크스페이스 파일 경로
BUILD_DIR="ios/build" # 빌드 결과물 저장 디렉터리

# 터미널 출력 색상 정의 (가독성 향상)
RED='\033[0;31m'      # 오류 메시지
GREEN='\033[0;32m'    # 성공 메시지
YELLOW='\033[1;33m'   # 경고 메시지
BLUE='\033[0;34m'     # 정보 메시지
PURPLE='\033[0;35m'   # 빌드 진행 메시지
CYAN='\033[0;36m'     # 헤더 메시지
NC='\033[0m'          # 색상 초기화

# 로그 출력 함수 정의 (일관된 메시지 형식)
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_build() { echo -e "${PURPLE}🔨 $1${NC}"; }

# 빌드 시작 헤더 출력
echo -e "${CYAN}"
echo "================================================"
echo " iOS 로컬 빌드 스크립트"
echo "================================================"
echo -e "${NC}"

log_info "빌드 설정 정보:"
echo "  - 환경: $MODE"
echo "  - 빌드 번호: $BUILD_NUMBER"
echo "  - 워크스페이스: $WORKSPACE"
echo "  - 스킴: $SCHEME"
echo "  - 빌드 디렉터리: $BUILD_DIR"
echo ""

# macOS 환경 검증 (iOS 빌드는 macOS에서만 가능)
if [ "$(uname)" != "Darwin" ]; then
    log_error "iOS 빌드는 macOS에서만 가능합니다."
    log_error "현재 운영체제: $(uname)"
    log_warning "해결방법: macOS 환경에서 실행하거나 GitHub Actions 사용"
    exit 1
fi

# 필수 도구 설치 확인
log_info "필수 도구 설치 상태 확인 중..."
missing_tools=() # 누락된 도구 목록을 저장할 배열

# Xcode 설치 확인
if ! command -v xcodebuild >/dev/null 2>&1; then
    missing_tools+=("Xcode")
fi

# Node.js 설치 확인
if ! command -v node >/dev/null 2>&1; then
    missing_tools+=("Node.js")
fi

# npx 설치 확인 (Node.js와 함께 설치됨)
if ! command -v npx >/dev/null 2>&1; then
    missing_tools+=("npx")
fi

# 누락된 도구가 있으면 설치 안내 후 종료
if [ ${#missing_tools[@]} -ne 0 ]; then
    log_error "다음 도구들이 설치되지 않았습니다:"
    for tool in "${missing_tools[@]}"; do
        echo "   - $tool"
    done
    echo ""
    log_warning "설치 방법:"
    echo "   - Xcode: App Store에서 설치"
    echo "   - Node.js: https://nodejs.org에서 설치"
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
    log_warning "해결방법: 해당 환경의 .env 파일을 생성하세요."
    exit 1
fi

# 환경 설정 파일을 현재 사용할 .env로 복사
log_info "환경 설정 적용: $ENV_FILE"
cp "$ENV_FILE" .env

# 적용된 환경 설정 내용 출력 (민감한 정보는 마스킹)
echo "📄 적용된 환경 설정:"
cat .env | sed 's/\(.*PASSWORD.*=\).*/\1***/' | sed 's/\(.*SECRET.*=\).*/\1***/'
echo ""

# CocoaPods 의존성 설치 (iOS 네이티브 라이브러리 관리)
log_build "CocoaPods 의존성 동기화 중..."
if ! npx pod-install ios; then
    log_error "CocoaPods 설치 실패!"
    log_warning "수동 설치 방법:"
    echo "   cd ios && pod install"
    log_warning "캐시 정리 후 재설치:"
    echo "   cd ios && pod deintegrate && pod install"
    exit 1
fi
log_success "CocoaPods 동기화 완료"

# 기존 빌드 파일 정리 (클린 빌드 보장)
log_build "기존 빌드 파일 정리 중..."
rm -rf "$BUILD_DIR"
log_success "빌드 파일 정리 완료"

# Xcode 빌드 실행
log_build "Xcode 시뮬레이터용 Release 빌드 시작..."
log_info "빌드 상세 설정:"
echo "   - 워크스페이스: $WORKSPACE"
echo "   - 스킴: $SCHEME"
echo "   - 구성: Release"
echo "   - SDK: iphonesimulator (시뮬레이터용)"
echo "   - 빌드 디렉터리: $BUILD_DIR"
echo ""

# Xcode 빌드 명령어 실행
# xcpretty: 빌드 로그를 보기 좋게 포맷팅하는 도구
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
    log_warning "일반적인 해결방법:"
    echo "   1. Xcode에서 프로젝트를 열어 수동 빌드 시도"
    echo "   2. Product > Clean Build Folder 실행"
    echo "   3. 프로젝트 설정에서 Team과 Bundle Identifier 확인"
    exit 1
fi

# 빌드 결과 확인 및 처리
APP_PATH="$BUILD_DIR/Build/Products/Release-iphonesimulator/mobile.app"

# 빌드된 앱 파일 존재 확인
if [ -d "$APP_PATH" ]; then
    log_success "iOS 앱 빌드 성공!"
    
    # 앱 정보 출력
    log_info "빌드된 앱 정보:"
    echo "   - 경로: $APP_PATH"
    ls -la "$APP_PATH" | head -5 # 앱 내부 파일 일부 출력
    
    # 앱 크기 계산
    APP_SIZE=$(du -sh "$APP_PATH" | awk '{print $1}')
    echo "   - 크기: $APP_SIZE"
    
    # 배포용 앱 압축
    log_build "배포용 앱 압축 중..."
    
    # 앱이 있는 디렉터리로 이동
    cd "$(dirname "$APP_PATH")"
    
    # 압축 파일명 생성 (환경-빌드번호.app.zip 형식)
    ZIP_NAME="mobile-${MODE}-${BUILD_NUMBER}.app.zip"
    
    # ZIP 압축 실행
    if zip -r "$ZIP_NAME" mobile.app >/dev/null 2>&1; then
        # 압축 파일 크기 계산
        ZIP_SIZE=$(du -sh "$ZIP_NAME" | awk '{print $1}')
        log_success "앱 압축 완료!"
        echo "   - 압축 파일: $ZIP_NAME"
        echo "   - 압축 크기: $ZIP_SIZE"
        
        # 압축 파일의 절대 경로 저장
        ZIP_FULL_PATH="$(pwd)/$ZIP_NAME"
        echo "   - 전체 경로: $ZIP_FULL_PATH"
    else
        log_error "앱 압축 실패!"
        log_warning "수동 압축 방법:"
        echo "   cd $(dirname "$APP_PATH")"
        echo "   zip -r mobile-${MODE}-${BUILD_NUMBER}.app.zip mobile.app"
        exit 1
    fi

     # 빌드 완료 요약 출력
    echo ""
    echo -e "${GREEN}"
    echo "🎉 iOS 빌드 완료!"
    echo "=================================================="
    echo "📋 빌드 결과 요약:"
    echo "   - 환경: $MODE"
    echo "   - 빌드 번호: $BUILD_NUMBER"
    echo "   - 앱 크기: $APP_SIZE"
    echo "   - 압축 크기: $ZIP_SIZE"
    echo "   - 시뮬레이터 빌드: $ZIP_FULL_PATH"
    echo "=================================================="
    echo -e "${NC}"
    
    # 다음 단계 안내
    log_info "다음 단계 안내:"
    echo "   1. 시뮬레이터에서 테스트:"
    echo "      - iOS Simulator 실행"
    echo "      - 앱 파일을 시뮬레이터로 드래그 앤 드롭"
    echo ""
    echo "   2. 실기기 빌드 (필요시):"
    echo "      - Xcode에서 Team 설정 완료 후"
    echo "      - 실기기용 빌드 스크립트 실행"
    echo ""
    echo "   3. 배포 준비:"
    echo "      - 압축 파일을 Jenkins 또는 배포 서버에 업로드"
    echo "      - TestFlight 또는 App Store Connect 업로드"
    
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
    echo "   4. CocoaPods 의존성 문제 확인:"
    echo "      cd ios && pod deintegrate && pod install"
    echo "   5. Xcode Command Line Tools 확인:"
    echo "      xcode-select --install"
    echo "   6. 시뮬레이터 런타임 확인:"
    echo "      xcrun simctl list runtimes"
    
    exit 1
fi

# 추가 정보 출력
echo ""
log_info "추가 정보:"
echo "ℹ️ 실기기(iphoneos) 빌드는 Xcode 서명 설정 후 다음 명령으로 진행:"
echo "xcodebuild -workspace $WORKSPACE -scheme $SCHEME -configuration Release -sdk iphoneos -derivedDataPath ios/build build"
echo ""
log_info "빌드 스크립트 완료 - $(date '+%Y-%m-%d %H:%M:%S')"
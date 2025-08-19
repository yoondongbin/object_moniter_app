#!/bin/bash
# CI/CD 환경 변수 생성 스크립트

set -euo pipefail

# 필수 환경변수 확인
if [ -z "${APP_ENV:-}" ] || [ -z "${API_BASE_URL:-}" ]; then
    echo "❌ 필수 환경변수가 설정되지 않았습니다!"
    echo "필요한 변수: APP_ENV, API_BASE_URL"
    exit 1
fi

# 환경별 기본값 설정
case "$APP_ENV" in
    "development")
        TIMEOUT="${TIMEOUT:-10000}"
        DEBUG_MODE="${DEBUG_MODE:-true}"
        LOG_LEVEL="${LOG_LEVEL:-debug}"
        ;;
    "staging")
        TIMEOUT="${TIMEOUT:-15000}"
        DEBUG_MODE="${DEBUG_MODE:-false}"
        LOG_LEVEL="${LOG_LEVEL:-info}"
        ;;
    "production")
        TIMEOUT="${TIMEOUT:-20000}"
        DEBUG_MODE="${DEBUG_MODE:-false}"
        LOG_LEVEL="${LOG_LEVEL:-warn}"
        ;;
esac

# .env 파일 생성
cat > .env.${APP_ENV} << ENVEOF
APP_ENV=${APP_ENV}
API_BASE_URL=${API_BASE_URL}
TIMEOUT=${TIMEOUT}
DEBUG_MODE=${DEBUG_MODE}
LOG_LEVEL=${LOG_LEVEL}
BUILD_NUMBER=${BUILD_NUMBER:-dev}
BUILD_TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
ENVEOF

# 현재 환경 파일로 복사
cp .env.${APP_ENV} .env

echo "✅ 환경 설정 파일 생성 완료: .env.${APP_ENV}"
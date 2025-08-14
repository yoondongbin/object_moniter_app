#!/bin/bash

set -e

ENV=${1:-staging}

echo "🚀 배포용 Release 빌드 시작 - 환경: $ENV"
echo "============================================\n"

# 키스토어 파일 확인
KEYSTORE_PATH="android/app/my-upload-key.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ 키스토어 파일이 없습니다: $KEYSTORE_PATH"
    exit 1
fi

# 환경 파일 설정
echo "📋 환경 설정 중..."
if [ "$ENV" = "production" ]; then
    echo "🏭 프로덕션 환경 설정"
    if [ ! -f ".env.production" ]; then
        echo "❌ .env.production 파일이 없습니다."
        exit 1
    fi
    cp .env.production .env
elif [ "$ENV" = "staging" ]; then
    echo "🧪 스테이징 환경 설정"
    if [ ! -f ".env.staging" ]; then
        echo "❌ .env.staging 파일이 없습니다."
        exit 1
    fi
    cp .env.staging .env
else
    echo "❌ 지원하지 않는 환경: $ENV"
    echo "💡 사용 가능한 환경: staging, production"
    exit 1
fi

# 의존성 설치
echo "📦 의존성 설치 중..."
yarn install --frozen-lockfile

# Android Release 빌드
echo "\n🤖 Android Release 빌드 시작..."
cd android

echo "🧹 이전 빌드 정리 중..."
./gradlew clean

echo "🔨 Release APK 빌드 중..."
./gradlew assembleRelease

# 빌드 결과 확인
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "\n✅ Release APK 생성 성공!"
    echo "📱 위치: android/$APK_PATH"
    
    # 파일 정보 표시
    SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    echo "📊 APK 크기: $SIZE"
    
else
    echo "\n❌ Release APK 생성 실패!"
    exit 1
fi

cd ..

echo "\n🎉 배포용 Release 빌드 완료!"
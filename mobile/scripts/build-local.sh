#!/bin/bash

set -e

BUILD_TYPE=${1:-debug}

echo "🛠️ 로컬 개발 빌드 시작 - 타입: $BUILD_TYPE"
echo "=====================================\n"

# 개발 환경 설정
echo "📋 개발 환경 설정 중..."
cp .env.development .env

# 의존성 확인
echo "📦 의존성 확인 중..."
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    yarn install
fi

# Android 빌드
echo "\n🤖 Android 빌드 시작..."
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    echo "🚀 Release 빌드 (프로덕션 키스토어 사용)"
    ./gradlew clean
    ./gradlew assembleRelease
    
    echo "\n✅ Release APK 생성 완료!"
    echo "📱 위치: android/app/build/outputs/apk/release/app-release.apk"
    
    # 파일 크기 표시
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
        echo "📊 APK 크기: $SIZE"
    fi
else
    echo "🔧 Debug 빌드"
    ./gradlew assembleDebug
    
    echo "\n✅ Debug APK 생성 완료!"
    echo "📱 위치: android/app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

echo "\n🎉 빌드 완료!"
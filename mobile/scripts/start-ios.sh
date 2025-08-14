#!/bin/bash

# iOS 시뮬레이터 자동 시작 및 앱 실행 스크립트

set -e

echo "🍎 iOS 개발 환경 시작 중..."

# 1) 환경 파일 복사 및 빌드 설정
if [ "$1" = "staging" ]; then
    echo "📱 스테이징 환경 설정 중..."
    cp .env.staging .env
    IOS_CONFIGURATION="Release"
elif [ "$1" = "prod" ]; then
    echo "🏭 프로덕션 환경 설정 중..."
    cp .env.production .env
    IOS_CONFIGURATION="Release"
else
    echo "🛠️ 개발 환경 설정 중..."
    cp .env.development .env
    IOS_CONFIGURATION="Debug"
fi

# 2) CocoaPods 동기화
echo "📦 CocoaPods 설치/동기화 중..."
npx pod-install ios

# 3) iOS 시뮬레이터 상태 확인
echo "📱 iOS 시뮬레이터 상태 확인 중..."
RUNNING_SIMULATORS=$(xcrun simctl list devices | grep "(Booted)" | wc -l | tr -d ' ')

if [ "$RUNNING_SIMULATORS" -eq 0 ]; then
    echo "📱 실행 중인 시뮬레이터가 없습니다. 시뮬레이터를 시작합니다..."
    DEVICE_ID=$(xcrun simctl list devices available | grep "iPhone" | grep -v "SE" | tail -1 | sed 's/.*(\([^)]*\)).*/\1/')
    if [ -n "$DEVICE_ID" ]; then
        echo "🚀 iPhone 시뮬레이터 시작 중... (ID: $DEVICE_ID)"
        xcrun simctl boot "$DEVICE_ID" || true
        open -a Simulator || true
        echo "⏳ 시뮬레이터 부팅 대기 중..."
        sleep 5
    else
        echo "❌ 사용 가능한 iPhone 시뮬레이터를 찾을 수 없습니다."
        echo "Xcode에서 시뮬레이터를 설치해주세요."
        exit 1
    fi
else
    echo "✅ 실행 중인 시뮬레이터: $RUNNING_SIMULATORS개"
fi

echo "📱 현재 실행 중인 시뮬레이터:"
xcrun simctl list devices | grep "(Booted)" || true

# 4) 앱 실행: Debug는 기본, Staging/Prod는 Release 모드로 설치(메트로 미사용)
echo "🚀 앱 빌드 및 설치 중...(iOS $IOS_CONFIGURATION)"
if [ "$IOS_CONFIGURATION" = "Debug" ]; then
  npx react-native run-ios
else
  RCT_NO_LAUNCH_PACKAGER=1 npx react-native run-ios --mode Release --no-packager
fi

echo "✅ iOS 앱 실행 완료!"

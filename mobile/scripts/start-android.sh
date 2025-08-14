#!/bin/bash

# Android 에뮬레이터 자동 시작 및 앱 실행 스크립트

set -e  # 에러 발생시 스크립트 중단

echo "🚀 Android 개발 환경 시작 중..."

# 환경 파일 복사
if [ "$1" = "staging" ]; then
    echo "📱 스테이징 환경 설정 중..."
    cp .env.staging .env
    VARIANT="--variant=staging"
elif [ "$1" = "prod" ]; then
    echo "🏭 프로덕션 환경 설정 중..."
    cp .env.production .env
    VARIANT="--variant=release"
else
    echo "🛠️ 개발 환경 설정 중..."
    cp .env.development .env
    VARIANT=""
fi

# 현재 연결된 디바이스 확인
DEVICES=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)

if [ $DEVICES -eq 0 ]; then
    echo "📱 연결된 디바이스가 없습니다. 에뮬레이터를 시작합니다..."
    
    # 에뮬레이터 백그라운드 시작 (Pixel_7 우선, 없으면 Pixel_5)
    if emulator -list-avds | grep -q "Pixel_7"; then
        echo "🚀 Pixel_7 에뮬레이터 시작 중..."
        emulator -avd Pixel_7 -netdelay none -netspeed full -no-snapshot -no-boot-anim &
    elif emulator -list-avds | grep -q "Pixel_5"; then
        echo "🚀 Pixel_5 에뮬레이터 시작 중..."
        emulator -avd Pixel_5 -netdelay none -netspeed full -no-snapshot -no-boot-anim &
    else
        echo "❌ 사용 가능한 에뮬레이터가 없습니다."
        echo "Android Studio에서 AVD를 생성해주세요."
        exit 1
    fi
    
    # 에뮬레이터 부팅 대기
    echo "⏳ 에뮬레이터 부팅 대기 중..."
    adb wait-for-device
    
    # 부팅 완료까지 대기
    echo "⏳ 부팅 완료 대기 중..."
    for i in {1..60}; do
        BOOT_COMPLETED=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || echo "0")
        if [ "$BOOT_COMPLETED" = "1" ]; then
            echo "✅ 에뮬레이터 부팅 완료!"
            break
        fi
        sleep 2
        echo "   부팅 중... ($i/60)"
    done
    
    if [ "$BOOT_COMPLETED" != "1" ]; then
        echo "⚠️ 에뮬레이터 부팅이 완료되지 않았을 수 있습니다."
        echo "계속 진행합니다..."
    fi
    
    # 포트 포워딩 설정
    echo "🔌 포트 포워딩 설정 중..."
    adb reverse tcp:8081 tcp:8081 || true
    adb reverse tcp:9090 tcp:9090 || true
    
else
    echo "✅ 연결된 디바이스: $DEVICES개"
fi

# 연결된 디바이스 목록 표시
echo "📱 현재 연결된 디바이스:"
adb devices -l

# React Native 앱 실행
echo "🚀 앱 빌드 및 설치 중..."
# 로컬 프로젝트의 CLI로 실행 (글로벌 설치 불필요)
npx react-native run-android $VARIANT

echo "✅ Android 앱 실행 완료!"

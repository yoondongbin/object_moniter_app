#!/bin/bash
set -euo pipefail

BUILD_TYPE=${1:-release}
AVD_NAME=${2:-}
APK_PATH=""

echo "📱 기기에 APK 설치 시작 - 빌드 타입: $BUILD_TYPE"
echo "==============================================="

# APK 경로 설정
if [ "$BUILD_TYPE" = "debug" ]; then
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
else
  APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
fi

if [ ! -f "$APK_PATH" ]; then
  echo "❌ APK 없음: $APK_PATH"
  echo "💡 먼저 빌드: ./scripts/build-local.sh $BUILD_TYPE  또는  ./scripts/build-release.sh staging|production"
  exit 1
fi

pick_avd() {
  if [ -n "${AVD_NAME:-}" ]; then
    echo "$AVD_NAME"
    return
  fi
  if emulator -list-avds | grep -q "Pixel_7"; then
    echo "Pixel_7"
  else
    emulator -list-avds | head -1
  fi
}

boot_emulator_if_needed() {
  local count
  count=$(adb devices | awk 'NR>1 && $2=="device"' | wc -l | tr -d ' ')
  if [ "$count" -eq 0 ]; then
    local avd
    avd=$(pick_avd)
    if [ -z "$avd" ]; then
      echo "❌ 사용 가능한 AVD가 없습니다. Android Studio에서 AVD를 하나 생성하세요."
      exit 1
    fi
    echo "🚀 에뮬레이터 시작: $avd"
    nohup emulator -avd "$avd" -netdelay none -netspeed full -no-snapshot -no-boot-anim >/dev/null 2>&1 &
    echo "⏳ 부팅 대기..."
    adb wait-for-device
    i=0
    while [ "$i" -lt 60 ]; do
      state=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
      if [ "$state" = "1" ]; then break; fi
      sleep 2
      i=$((i+1))
    done
  fi
}

pick_device_id() {
  local physical emulator_id
  physical=$(adb devices | awk 'NR>1 && $1!~/^emulator-/ && $2=="device"{print $1; exit}')
  if [ -n "$physical" ]; then
    echo "$physical"
    return
  fi
  emulator_id=$(adb devices | awk 'NR>1 && $1~/^emulator-/ && $2=="device"{print $1; exit}')
  echo "$emulator_id"
}

echo "🔍 연결된 기기 확인 중..."
boot_emulator_if_needed
adb devices

DEVICE_ID=$(pick_device_id)
if [ -z "$DEVICE_ID" ]; then
  echo "❌ 기기를 찾지 못했습니다."
  exit 1
fi
echo "✅ 대상 디바이스: $DEVICE_ID"

echo ""
echo "🗑️ 기존 앱 제거 중..."
adb -s "$DEVICE_ID" uninstall com.mobile >/dev/null 2>&1 || true

echo ""
echo "📲 APK 설치 중..."
adb -s "$DEVICE_ID" install -r "$APK_PATH"

echo ""
echo "🚀 앱 실행 중..."
adb -s "$DEVICE_ID" shell am start -n com.mobile/.MainActivity

echo ""
echo "✅ 설치 및 실행 완료!"
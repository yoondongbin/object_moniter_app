#!/bin/bash
set -e

APP_PATH="ios/build/Build/Products/Release-iphoneos/mobile.app"

if [ ! -d "$APP_PATH" ]; then
  echo "❌ $APP_PATH 가 없습니다."
  echo "💡 먼저 실기기용 빌드:"
  echo "xcodebuild -workspace ios/mobile.xcworkspace -scheme mobile -configuration Release -sdk iphoneos -derivedDataPath ios/build build"
  exit 1
fi

if ! command -v ios-deploy >/dev/null 2>&1; then
  echo "❌ ios-deploy 미설치"
  echo "brew install ios-deploy"
  exit 1
fi

echo "📲 실기기에 앱 설치 중..."
ios-deploy --bundle "$APP_PATH" --justlaunch
echo "✅ 설치 완료!"



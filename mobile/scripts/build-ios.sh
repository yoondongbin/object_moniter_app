#!/bin/bash
set -e

MODE=${1:-staging}  # staging | production
SCHEME="mobile"
WORKSPACE="ios/mobile.xcworkspace"

echo "🏗️ iOS Release 빌드 시작 - 모드: $MODE"
if [ "$MODE" = "production" ]; then
  echo "📋 .env.production 적용"
  cp .env.production .env
else
  echo "📋 .env.staging 적용"
  cp .env.staging .env
fi

echo "📦 CocoaPods 동기화"
npx pod-install ios

echo "🔨 시뮬레이터용 Release 빌드"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ios/build \
  build | xcpretty || true

echo "✅ 시뮬레이터 빌드 산출물: ios/build/Build/Products/Release-iphonesimulator"

echo "ℹ️ 실기기(iphoneos) 빌드는 Xcode 서명 설정 후 아래 명령으로 진행하세요:"
echo "xcodebuild -workspace $WORKSPACE -scheme $SCHEME -configuration Release -sdk iphoneos -derivedDataPath ios/build build"



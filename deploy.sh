#!/bin/bash

# Object Monitor 배포 스크립트

set -e

echo "🚀 Object Monitor 배포 시작..."

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다. .env.example을 복사하여 설정하세요."
    exit 1
fi

# 환경 변수 로드
source .env

# 필수 환경 변수 확인
required_vars=("SECRET_KEY" "JWT_SECRET_KEY" "MYSQL_PASSWORD" "MYSQL_ROOT_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ 필수 환경 변수가 설정되지 않았습니다: $var"
        exit 1
    fi
done

echo "✅ 환경 변수 확인 완료"

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너 중지..."
docker compose -f docker-compose.prod.yml down

# 이미지 빌드
echo "🔨 이미지 빌드 중..."
docker compose -f docker-compose.prod.yml build --no-cache

# 컨테이너 시작
echo "🚀 컨테이너 시작..."
docker compose -f docker-compose.prod.yml up -d

# 헬스체크 대기
echo "⏳ 서비스 헬스체크 대기 중..."
sleep 30

# 헬스체크 확인
if curl -f http://localhost:5010/api/health > /dev/null 2>&1; then
    echo "✅ 배포 성공! API가 정상 동작합니다."
    echo "📊 서비스 상태:"
    docker compose -f docker-compose.prod.yml ps
else
    echo "❌ 배포 실패! API가 응답하지 않습니다."
    echo "📋 로그 확인:"
    docker compose -f docker-compose.prod.yml logs backend
    exit 1
fi

echo "🎉 배포 완료!"
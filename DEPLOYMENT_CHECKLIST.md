# 🚀 배포 준비 체크리스트

## 📋 필수 준비사항

### 1. 보안 설정
- [ ] `.env` 파일 생성 (`.env.example` 참고)
- [ ] `SECRET_KEY` 변경 (기본값 사용 금지)
- [ ] `JWT_SECRET_KEY` 변경 (기본값 사용 금지)
- [ ] 데이터베이스 비밀번호 강화
- [ ] CORS 설정 (프론트엔드 도메인 지정)

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env
# .env 파일 편집하여 실제 값으로 변경
```

### 3. 로깅 설정
- [ ] 로그 레벨 설정 (production: INFO/WARNING)
- [ ] 로그 파일 경로 설정
- [ ] 로그 로테이션 설정

### 4. 데이터베이스 백업
- [ ] 기존 데이터 백업 (필요시)
- [ ] 데이터베이스 마이그레이션 스크립트 준비

### 5. 네트워크 보안
- [ ] 방화벽 설정 (필요한 포트만 개방)
- [ ] SSL 인증서 설정 (HTTPS)
- [ ] 도메인 설정 (DNS)

### 6. 모니터링 설정
- [ ] 헬스체크 엔드포인트 확인
- [ ] 로그 모니터링 설정
- [ ] 알림 설정 (오류 발생시)

## 🔧 배포 명령어

### 개발 환경
```bash
# 개발용 실행
docker compose up -d

# 개발용 중지
docker compose down
```

### 프로덕션 환경
```bash
# 배포 스크립트 실행
./deploy.sh

# 수동 배포
docker compose -f docker-compose.prod.yml up -d

# 프로덕션 중지
docker compose -f docker-compose.prod.yml down
```

## 📊 배포 후 확인사항

### 1. 서비스 상태 확인
```bash
# 컨테이너 상태
docker compose -f docker-compose.prod.yml ps

# 헬스체크
curl http://localhost:5010/api/health
```

### 2. 로그 확인
```bash
# 백엔드 로그
docker compose -f docker-compose.prod.yml logs backend

# 데이터베이스 로그
docker compose -f docker-compose.prod.yml logs db
```

### 3. API 테스트
```bash
# 회원가입
curl -X POST http://localhost:5010/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 로그인
curl -X POST http://localhost:5010/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🚨 주의사항

### 보안
- [ ] 기본 비밀번호 변경
- [ ] 불필요한 포트 노출 금지
- [ ] 환경 변수 노출 금지
- [ ] 로그에 민감 정보 포함 금지

### 성능
- [ ] 데이터베이스 인덱스 최적화
- [ ] 이미지 업로드 크기 제한
- [ ] API 응답 시간 모니터링

### 백업
- [ ] 정기적인 데이터베이스 백업
- [ ] 설정 파일 백업
- [ ] 로그 파일 백업

## 🔄 롤백 계획

### 긴급 롤백
```bash
# 이전 버전으로 롤백
docker compose -f docker-compose.prod.yml down
docker image tag object_moniter_app-backend:previous object_moniter_app-backend:latest
docker compose -f docker-compose.prod.yml up -d
```

### 데이터 복구
```bash
# 데이터베이스 백업에서 복구
docker exec -i object_monitor_db_prod mariadb -u root -p < backup.sql
```

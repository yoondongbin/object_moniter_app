# Object Monitor Backend

Flask 기반의 객체 모니터링 백엔드 API 서버입니다.

## 🚀 기능

- **사용자 인증**: JWT 기반 로그인/회원가입
- **객체 관리**: 모니터링 대상 객체 CRUD
- **로그 관리**: 객체별 모니터링 로그 기록
- **RESTful API**: 표준 REST API 엔드포인트

## 📁 프로젝트 구조

```
Object_monitor_back/
├── app.py              # 메인 애플리케이션
├── config.py           # 설정 파일
├── models.py           # 데이터베이스 모델
├── routes.py           # API 라우트
├── requirements.txt    # Python 의존성
└── README.md          # 프로젝트 문서
```

## 🛠️ 설치 및 실행

### 1. 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate     # Windows
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성 (예시)

# Flask 설정
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
HOST=0.0.0.0
PORT=5000

# MariaDB 연결 설정
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=object_monitor

# 또는 전체 DATABASE_URL 사용
# DATABASE_URL=mysql+pymysql://username:password@localhost:3306/database_name
```

### 4. MariaDB 설정 (선택사항)

#### MariaDB 설치 및 데이터베이스 생성
```bash
# MariaDB 설치 (Ubuntu/Debian)
sudo apt-get install mariadb-server

# MariaDB 설치 (macOS)
brew install mariadb

# MariaDB 서비스 시작
sudo systemctl start mariadb  # Linux
brew services start mariadb   # macOS

# MariaDB 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE object_monitor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 사용자 생성 (선택사항)
CREATE USER 'object_monitor_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON object_monitor.* TO 'object_monitor_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. 데이터베이스 초기화
```bash
python app.py
```

### 6. 서버 실행
```bash
python app.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

## 📚 API 문서

### 인증 API

#### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
```

#### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

### 객체 관리 API

#### 객체 목록 조회
```
GET /api/objects
Authorization: Bearer <token>
```

#### 객체 생성
```
POST /api/objects
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "서버 1",
    "description": "웹 서버"
}
```

#### 객체 조회
```
GET /api/objects/<object_id>
Authorization: Bearer <token>
```

#### 객체 수정
```
PUT /api/objects/<object_id>
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "서버 1 (수정됨)",
    "description": "웹 서버 (수정됨)",
    "status": "inactive"
}
```

#### 객체 삭제
```
DELETE /api/objects/<object_id>
Authorization: Bearer <token>
```

### 로그 관리 API

#### 로그 목록 조회
```
GET /api/objects/<object_id>/logs
Authorization: Bearer <token>
```

#### 로그 생성
```
POST /api/objects/<object_id>/logs
Authorization: Bearer <token>
Content-Type: application/json

{
    "event_type": "error",
    "message": "서버 연결 실패"
}
```

## 🗄️ 데이터베이스 모델

### User (사용자)
- `id`: 기본 키
- `username`: 사용자명 (고유)
- `email`: 이메일 (고유)
- `password_hash`: 비밀번호 해시
- `created_at`: 생성 시간

### Object (객체)
- `id`: 기본 키
- `name`: 객체명
- `description`: 설명
- `status`: 상태 (active/inactive)
- `user_id`: 사용자 ID (외래 키)
- `created_at`: 생성 시간
- `updated_at`: 수정 시간

### MonitoringLog (모니터링 로그)
- `id`: 기본 키
- `object_id`: 객체 ID (외래 키)
- `event_type`: 이벤트 타입
- `message`: 로그 메시지
- `timestamp`: 타임스탬프

## 🔧 개발 환경

### 기술 스택
- **Flask**: 웹 프레임워크
- **SQLAlchemy**: ORM
- **Flask-JWT-Extended**: JWT 인증
- **Flask-CORS**: CORS 지원
- **python-dotenv**: 환경 변수 관리
- **PyMySQL**: MariaDB/MySQL 드라이버

### 개발 도구
- **Python 3.8+**
- **pip**: 패키지 관리
- **MariaDB/MySQL**: 데이터베이스 (SQLite도 지원)

## 🧪 테스트

### API 테스트 예제 (curl)

```bash
# 1. 회원가입
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. 로그인
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 3. 객체 생성 (토큰 필요)
curl -X POST http://localhost:5000/api/objects \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"서버 1","description":"웹 서버"}'

# 4. 객체 목록 조회
curl -X GET http://localhost:5000/api/objects \
  -H "Authorization: Bearer <your-token>"
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 
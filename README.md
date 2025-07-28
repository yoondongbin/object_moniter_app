# 📱 객체 탐지 관리자용 앱 (React Native + FastAPI)

> CCTV 및 바닥에 기반 객체 탐지 결과를 확인하고, 위험 알림 및 통계 정보를 시각적으로 관리하는 **⚡모바일 앱**

---

## 📚 프로젝트 구조

```
react_app/
├─ mobile/                    # 📱 React Native 앱
│  ├─ App.tsx                # 앱 루트
│  ├─ index.js               # 엔트리 포인트
│  └─ src/
│     ├─ screens/            # 페이지들 화면
│     │  ├─ MainScreen.tsx
│     │  ├─ DetailScreen.tsx
│     │  ├─ StatsScreen.tsx
│     │  └─ UploadScreen.tsx
│     ├─ components/         # 공용 UI 컴포넌트
│     │  ├─ Header.tsx
│     │  └─ DetectionCard.tsx
│     ├─ styles/             # 스타일 톤리
│     │  └─ MainScreen.styles.ts
│     ├─ api/               # axios API 통신
│     │  ├─ detectionApi.ts
│     │  └─ uploadApi.ts
│     ├─ constants/         # 색상, 상수 등
│     │  └─ colors.ts
│     └─ navigation/        # Stack, Tab 네비게이션
│        └─ AppNavigator.tsx
│
└─ backend/                  # 🚀 FastAPI 백엔드
   ├─ main.py
   ├─ routers/
   ├─ models/
   ├─ schemas/
   └─ database.py
```

---

## 🛠️ 백엔드 기능 (FastAPI)

- ✅ 탐지 결과 수신 API (`POST /detections`)
- 📊 통계 API (`GET /stats`)  
- 📁 파일 업로드 API
- 🗃️ MariaDB 연동 및 저장

---

## 🚀 설치 방법

### 1. 프론트 설정 (React Native)

```bash
cd mobile
npm install
npm start
# 또는
npx expo start
```

### 2. 백엔드 설정 (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. 데이터베이스 설정 (MariaDB)

```bash
# MariaDB 설치 및 실행
# database.py에서 연결 설정 확인
```

---

## 📱 핵심 기능

### 1) 영상 관리 / 탐지 결과 확인
- 실시간 CCTV 객체 탐지 결과 확인
- 탐지된 위험 상황 알림 및 관리

### 2) 탐지 결과 통계 시각화(라인 차트)
- 시간대별/일별 탐지 통계
- 인터랙티브 차트로 데이터 분석

### 3) 위험 알림 푸시
- 실시간 위험 상황 알림
- 즉시 대응 가능한 푸시 알림

---

## 🎯 타겟: 관리자

**보안 관리자 및 안전 담당자**를 위한 직관적인 모바일 관리 도구

---

## 🖥️ 화면 구성

### 1) 메인 페이지 - 탐지 결과 리스트 + 알림 푸시
- 실시간 탐지 현황 대시보드
- 위험도별 알림 분류 및 관리

### 2) 탐지 상세 페이지  
- 개별 탐지 결과 상세 정보
- 이미지/영상 확인 및 조치 기록

### 3) 통계 페이지
- 시간대별/기간별 통계 차트
- 탐지 패턴 분석 및 리포트

---

## 🔧 기술 스택

- **Frontend**: React Native + TypeScript
- **Backend**: FastAPI + Python
- **Database**: MariaDB
- **API**: RESTful API + WebSocket (실시간 알림)
- **Charts**: React Native Chart Library

---

## 📝 개발 진행 상황

- [x] React Native 기본 프로젝트 설정
- [x] FastAPI 백엔드 구조 설계
- [ ] CCTV 탐지 API 연동
- [ ] 실시간 알림 시스템 구현
- [ ] 통계 차트 구현
- [ ] MariaDB 스키마 설계

---
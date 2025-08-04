# React Native Flask API 설정 가이드

이 문서는 React Native 앱에서 Flask API와 통신하기 위한 설정 방법을 설명합니다.

## 1. 설정 파일 구조

```
src/
├── config/
│   └── apiConfig.ts          # API 설정 및 엔드포인트 정의
├── services/
│   └── api/
│       ├── apiClient.ts      # Axios 기반 API 클라이언트
│       ├── detectionApi.ts   # 탐지 관련 API 함수들
│       └── exampleUsage.ts   # 사용 예시
```

## 2. 환경별 설정

### 개발 환경
- **URL**: `http://localhost:5010`
- **설정**: `src/config/apiConfig.ts`의 `DEVELOPMENT` 객체

### 프로덕션 환경
- **URL**: `https://your-production-api.com`
- **설정**: `src/config/apiConfig.ts`의 `PRODUCTION` 객체

## 3. 사용 방법

### 기본 API 호출
```typescript
import apiClient from './src/services/api/apiClient';

// GET 요청
const data = await apiClient.get('/api/detections');

// POST 요청
const newItem = await apiClient.post('/api/detections', {
  label: 'Test Object',
  confidence: 0.95
});
```

### 탐지 API 사용
```typescript
import { getDetections, getDetectionById } from './src/services/api/detectionApi';

// 탐지 목록 가져오기
const detections = await getDetections();

// 특정 탐지 상세 정보
const detection = await getDetectionById('detection-id');
```

## 4. 환경 변수 설정 (선택사항)

### react-native-dotenv 사용

1. 패키지 설치:
```bash
npm install react-native-dotenv --save-dev
```

2. babel.config.js 설정:
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ],
};
```

3. .env 파일 생성:
```
API_BASE_URL_DEV=http://localhost:5010
API_BASE_URL_PROD=https://your-production-api.com
API_TIMEOUT=10000
```

4. 환경 변수 사용:
```typescript
import { API_BASE_URL_DEV, API_BASE_URL_PROD } from '@env';

const config = {
  development: API_BASE_URL_DEV,
  production: API_BASE_URL_PROD,
};
```

## 5. 에러 처리

API 클라이언트는 자동으로 에러를 처리합니다:

- **401 에러**: 인증 실패 (토큰 만료 등)
- **404 에러**: 리소스를 찾을 수 없음
- **500 에러**: 서버 내부 오류
- **네트워크 에러**: 연결 실패

## 6. 파일 업로드

```typescript
import apiClient from './src/services/api/apiClient';

const uploadImage = async (imageUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'detection.jpg',
  } as any);

  const response = await apiClient.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};
```

## 7. 헬스 체크

```typescript
import apiClient from './src/services/api/apiClient';

const checkApiHealth = async () => {
  const isHealthy = await apiClient.healthCheck();
  console.log('API Health:', isHealthy);
};
```

## 8. 주의사항

1. **Android 에뮬레이터**: `localhost` 대신 `10.0.2.2` 사용
2. **iOS 시뮬레이터**: `localhost` 사용 가능
3. **실제 기기**: 컴퓨터의 IP 주소 사용
4. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용

## 9. 디버깅

API 요청/응답은 자동으로 콘솔에 로그됩니다:
- 요청: `API Request: GET /api/detections`
- 응답: `API Response: 200 /api/detections`
- 에러: `API Response Error: 404 /api/nonexistent` 
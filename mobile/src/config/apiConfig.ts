// API 설정
export const API_CONFIG = {
  // 개발 환경
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:5010',
    TIMEOUT: 10000,
  },
  // 프로덕션 환경
  PRODUCTION: {
    BASE_URL: 'https://your-production-api.com',
    TIMEOUT: 10000,
  },
};

// 환경 변수 사용 예시 (react-native-dotenv 사용 시)
// import { API_BASE_URL_DEV, API_BASE_URL_PROD } from '@env';
// 
// const envConfig = {
//   DEV_URL: API_BASE_URL_DEV || 'http://localhost:5010',
//   PROD_URL: API_BASE_URL_PROD || 'https://your-production-api.com',
//   TIMEOUT: 10000,
// };

export const getApiConfig = () => {
  if (__DEV__) {
    return API_CONFIG.DEVELOPMENT;
  }
  
  return API_CONFIG.DEVELOPMENT;
};

export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: { path: '/api/auth/login/', requiresAuth: false }, // POST
    REGISTER: { path: '/api/auth/register/', requiresAuth: false }, // POST
    REFRESH: { path: '/api/auth/refresh/', requiresAuth: true }, // POST
  },
  
  // 객체 관련
  OBJECTS: {
    LIST: { path: '/api/objects/', requiresAuth: true }, // GET
    DETAIL: (objectId: number) => ({ path: `/api/objects/${objectId}/`, requiresAuth: true }), // GET
    CREATE: { path: '/api/objects/', requiresAuth: true }, // POST
    UPDATE: (objectId: number) => ({ path: `/api/objects/${objectId}/`, requiresAuth: true }), // PUT
    DELETE: (objectId: number) => ({ path: `/api/objects/${objectId}/`, requiresAuth: true }), // DELETE
    SWITCH: (objectId: number) => ({ path: `/api/objects/${objectId}/status/`, requiresAuth: true }), // PATCH
  },

  // 객체 탐지 관련
  DETECTIONS: {
    LIST: () => ({ path: `/api/objects/detections/`, requiresAuth: true }), // GET
    DETAIL: (objectId: number, detectionId: number) => ({ path: `/api/objects/${objectId}/detections/${detectionId}/`, requiresAuth: true }), // GET
    DETECT: (objectId: number,) => ({ path: `/api/objects/${objectId}/detect/`, requiresAuth: true}), // POST
    UPDATE: (objectId: number, detectionId: number) => ({ path: `/api/objects/${objectId}/detections/${detectionId}/`, requiresAuth: true }), // PUT
    DELETE: (objectId: number, detectionId: number) => ({ path: `/api/objects/${objectId}/detections/${detectionId}/`, requiresAuth: true }), // DELETE
    STATS: (objectId: number) => ({ path: `/api/objects/${objectId}/detections/stats/`, requiresAuth: true }), // GET
    LOGS: (objectId: number) => ({ path: `/api/logs/${objectId}/`, requiresAuth: true }), // GET
  },
  
  // 알림 관련
  NOTIFICATIONS: {
    LIST: { path: '/api/notifications/', requiresAuth: true }, // GET
    DETAIL: (notificationId: number) => ({ path: `/api/notifications/${notificationId}/`, requiresAuth: true }), // GET
    BY_DETECTION: (detectionId: number) => ({ path: `/api/notifications/by-detection/${detectionId}/`, requiresAuth: true }),
    CHECK: (notificationId: number) => ({ path: `/api/notifications/${notificationId}/read/`, requiresAuth: true }), // PUT
    DELETE: (notificationId: number) => ({ path: `/api/notifications/${notificationId}/`, requiresAuth: true }), // DELETE
    SEND_INTERNAL: { path: '/api/notifications/send-internal/', requiresAuth: false }, // POST
  },
  
};

// 인증이 필요한 엔드포인트 패턴
export const AUTH_REQUIRED_PATTERNS = [
  '/api/notifications', 
  '/api/auth/refresh',
  '/api/objects',
  '/api/logs',
];

// 인증이 필요 없는 엔드포인트 패턴
export const AUTH_FREE_PATTERNS = [
  '/api/auth/login',
  '/api/auth/register',
]; 
import { Platform } from "react-native";
import Config from "react-native-config";

// 환경별 API 설정
export const API_CONFIG = {
  DEVELOPMENT: {
    BASE_URL: Config.API_BASE_URL || 'http://192.168.1.169:5010',
    TIMEOUT: Number(Config.TIMEOUT) || 10000,
  },
  STAGING: {
    BASE_URL: Config.API_BASE_URL || 'https://staging-api.your-domain.com',
    TIMEOUT: Number(Config.TIMEOUT) || 15000,
  },
  PRODUCTION: {
    BASE_URL: Config.API_BASE_URL || 'https://api.your-domain.com',
    TIMEOUT: Number(Config.TIMEOUT) || 15000,
  },
}

// 개선된 환경 감지 함수
function getCurrentEnvironment(): 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' {
  // react-native-config로 환경 구분
  if (Config.APP_ENV === 'staging') return 'STAGING';
  if (Config.APP_ENV === 'production') return 'PRODUCTION';
  return 'DEVELOPMENT'; // 기본값
}

export const getApiConfig = () => {
  const currentEnv = getCurrentEnvironment();
  console.log(`🌍 현재 환경: ${currentEnv}`);
  console.log(`🔗 API 기본 URL: ${API_CONFIG[currentEnv].BASE_URL}`);
  return API_CONFIG[currentEnv];
};

// 엔드포인트만 포함
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register', 
    REFRESH: '/api/auth/refresh',
  },
  
  // 객체 관련
  OBJECTS: {
    LIST: '/api/objects',
    DETAIL: (id: number) => `/api/objects/${id}`,
    CREATE: '/api/objects',
    UPDATE: (id: number) => `/api/objects/${id}`,
    DELETE: (id: number) => `/api/objects/${id}`,
    DETECT: (id: number) => `/api/objects/${id}/detect`,
  },

  // 탐지 결과 관련
  DETECTIONS: {
    LIST_ALL: '/api/objects/detections', // 모든 탐지 결과
    LIST_BY_OBJECT: (objectId: number) => `/api/objects/${objectId}/detections`,
    DETAIL: (objectId: number, detectionId: number) => `/api/objects/${objectId}/detections/${detectionId}`,
  },
  
  // 알림 관련
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    DETAIL: (id: number) => `/api/notifications/${id}`,
    MARK_READ: (id: number) => `/api/notifications/${id}/read`,
    DELETE: (id: number) => `/api/notifications/${id}`,
  },
  
  // 로그 관련  
  LOGS: {
    LIST: (objectId: number) => `/api/logs/${objectId}`,
  },

  // 시스템
  HEALTH: '/api/health',
} as const;

// 인증이 필요한 엔드포인트 패턴
export const AUTH_REQUIRED_PATTERNS = [
  '/api/objects',
  '/api/notifications', 
  '/api/logs',
  '/api/auth/refresh',
];

// 인증이 필요 없는 엔드포인트 패턴
export const AUTH_FREE_PATTERNS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
];
// 중앙 집중식 API 서비스 Export
// 모든 화면에서 일관된 import를 위한 통합 파일
import type {
    LoginRequest,
    RegisterRequest, 
    AuthResponse,
    User,
    ObjectItem,
    CreateObjectRequest,
    UpdateObjectRequest,
    DetectionResult,
    DetectedObject,
    Notification,
    MonitoringLog,
    ApiResponse
  } from '../../types/api';

// 인증 서비스
export { authService, AuthService } from './authApi';

// 객체 관리 서비스  
export { objectService, ObjectService } from './objectApi';

// 탐지 서비스
export { detectionService, DetectionService } from './detectionApi';

// 알림 서비스
export { notificationService, NotificationService } from './notificationApi';

// 통합 API 클라이언트
export { apiClient } from './apiClient';

// 타입들 재export
export type {
  LoginRequest,
  RegisterRequest, 
  AuthResponse,
  User,
  ObjectItem,
  CreateObjectRequest,
  UpdateObjectRequest,
  DetectionResult,
  DetectedObject,
  Notification,
  MonitoringLog,
  ApiResponse
} from '../../types/api';

// 기존 타입들과의 호환성을 위한 별칭
export type DetectionItem = DetectionResult;
export type ObjectData = ObjectItem;
export type NotificationData = Notification;
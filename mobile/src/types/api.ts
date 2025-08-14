// API 공통 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 인증 관련 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  message: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

// 사용자 타입
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

// 객체 타입
export interface ObjectItem {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectRequest {
  name: string;
  description: string;
}

export interface UpdateObjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// 탐지 결과 타입 - 백엔드 모델에 완전히 맞춤
export interface DetectionResult {
  id: number;
  object_id: number;
  detection_type: string; // 백엔드 필드
  object_class: string; // 백엔드 필드
  confidence: number;
  bbox_x?: number; // 백엔드 개별 필드
  bbox_y?: number;
  bbox_width?: number;
  bbox_height?: number;
  danger_level: 'safe' | 'low' | 'medium' | 'high'; // 백엔드 필드명
  image_path?: string;
  created_at: string;
  
  // 편의를 위한 조합 필드들 (선택적)
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // 기존 호환성을 위한 필드들 (선택적)
  detected_objects?: DetectedObject[];
  risk_level?: 'safe' | 'low' | 'medium' | 'high'; // danger_level의 별칭
}

export interface DetectedObject {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

// 알림 타입 - 백엔드 모델에 맞춤
export interface Notification {
  id: number;
  object_id: number;
  detection_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  title?: string; // 추가 필드
  notification_type?: 'high' | 'medium' | 'low'; // 추가 필드
}

// 로그 타입
export interface MonitoringLog {
  id: number;
  object_id: number;
  event_type: string;
  message: string;
  created_at: string;
}
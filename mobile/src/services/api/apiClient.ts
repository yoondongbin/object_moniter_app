import axiosInstance from '../../utils/axiosInstance';
import { authService } from './authApi';
import { objectService } from './objectApi';
import { detectionService } from './detectionApi';
import { notificationService } from './notificationApi';

// 통합 API 클라이언트 : 모든 서비스를 하나의 객체로 접근할 수 있게 함

class ApiClient {
  // 서버 인스턴스들
  auth = authService;
  objects = objectService;
  detections = detectionService;
  notifications = notificationService;

  // 직접 axios 인스턴스 접근 (필요시)
  get instance() {
    return axiosInstance;
  }

  // api 서버 상태 확인
  async healthCheck(): Promise<{ status: string, timestamp: string }> {
    try {
      const response = await axiosInstance.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      throw new Error('서버에 연결할 수 없습니다.')
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
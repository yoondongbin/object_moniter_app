import axiosInstance from "../../utils/axiosInstance";
import { API_ENDPOINTS } from "../../config/apiConfig";
import type {
  DetectionResult,
  ApiResponse
} from '../../types/api';

class DetectionService {
  private static instance: DetectionService;

  static getInstance(): DetectionService {
    if (!DetectionService.instance) {
      DetectionService.instance = new DetectionService();
    }
    return DetectionService.instance;
  }

  // 모든 탐지 결과 조회 - wrapped 응답
  async getDetections(): Promise<DetectionResult[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<DetectionResult[]>>(
        API_ENDPOINTS.DETECTIONS.LIST_ALL
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('탐지 결과 조회 실패:', error);
      throw new Error('탐지 결과를 불러올 수 없습니다.');
    }
  }

  // 특정 객체의 탐지 결과 조회 - wrapped 응답
  async getObjectDetections(objectId: number): Promise<DetectionResult[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<DetectionResult[]>>(
        API_ENDPOINTS.DETECTIONS.LIST_BY_OBJECT(objectId)
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('객체 탐지 결과 조회 실패:', error);
      throw new Error('탐지 결과를 불러올 수 없습니다.');
    }
  }

  // 별칭 메서드 - 기존 코드 호환성
  async getDetectionsByObject(objectId: number): Promise<DetectionResult[]> {
    return this.getObjectDetections(objectId);
  }

  // 특정 탐지 결과 상세 조회 - 직접 객체 반환
  async getDetectionDetail(objectId: number, detectionId: number): Promise<DetectionResult> {
    try {
      const response = await axiosInstance.get<DetectionResult>(
        API_ENDPOINTS.DETECTIONS.DETAIL(objectId, detectionId)
      );
      if (!response.data) {
        throw new Error('탐지 결과를 찾을 수 없습니다.');
      }
      return response.data;
    } catch (error: any) {
      console.error('탐지 결과 상세 조회 실패:', error);
      throw new Error('탐지 결과 상세 정보를 불러올 수 없습니다.');
    }
  }

  // 별칭 메서드 - 기존 코드 호환성
  async getDetection(objectId: number, detectionId: number): Promise<DetectionResult> {
    return this.getDetectionDetail(objectId, detectionId);
  }

  // 탐지 실행 (객체별)
  async executeDetection(objectId: number, frameData?: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.OBJECTS.DETECT(objectId),
        frameData ? { frame_data: frameData } : {}
      );
      console.log('탐지 실행 성공');
      return response.data;
    } catch (error: any) {
      console.error('탐지 실행 실패:', error);
      throw new Error(error.response?.data?.error || '탐지 실행에 실패했습니다.');
    }
  }
}

export const detectionService = DetectionService.getInstance();
export { DetectionService };
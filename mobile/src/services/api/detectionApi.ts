// src/services/api/DetectionService.ts
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { sendDetectionNotification, sendDangerLevelNotification } from '../../utils/alramUtils';

export type DetectionItem = {
  id?: number;
  object_id: number;
  detection_type: string;
  object_class: string;
  confidence: number;
  bbox_x: number;
  bbox_y: number;
  bbox_width: number;
  bbox_height: number;
  danger_level: 'safe' | 'low' | 'medium' | 'high';
  image_path?: string;
  created_at?: string;
  updated_at?: string;
};

export class DetectionService {
  private static instance: DetectionService;
  private objectId: number;

  private constructor(objectId: number = 1) {
    this.objectId = objectId;
  }

  public static getInstance(): DetectionService {
    if (!DetectionService.instance) {
      DetectionService.instance = new DetectionService();
    }
    return DetectionService.instance;
  }

  // objectId 설정 메서드 추가
  public setObjectId(objectId: number): void {
    this.objectId = objectId;
  }

  // 특정 객체의 탐지 목록 불러오기
  async getDetections(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DETECTIONS.LIST().path);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detections:`, error);
      throw error;
    }
  }

  // 특정 객체의 탐지 목록 불러오기
  async getDetectionsByObject(objectId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/objects/${objectId}/detections/`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detections for object ${objectId}:`, error);
      throw error;
    }
  }

  // 특정 객체의 탐지 통계 불러오기
  async getDetectionStatsByObject(objectId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/objects/${objectId}/detections/stats/`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detection stats for object ${objectId}:`, error);
      throw error;
    }
  }

  // 특정 탐지 상세 조회
  async getDetectionById(detectionId: number): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DETECTIONS.DETAIL(this.objectId, detectionId).path);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detection ${detectionId} for object ${this.objectId}:`, error);
      throw error;
    }
  }

  // 새로운 탐지 생성 (알림 포함)
  async createDetection(): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DETECTIONS.DETECT(this.objectId).path,
      );
      
      // 탐지 결과에 따라 알림 전송
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response as any;
        if (responseData.data && responseData.data.detection_result) {
          const detectionData = responseData.data.detection_result;
          
          // 위험도별 알림 전송
          if (detectionData.danger_level && detectionData.danger_level !== 'safe') {
            await sendDangerLevelNotification(
              detectionData.danger_level, 
              detectionData.confidence
            );
          } else {
            // 일반 객체 감지 알림
            await sendDetectionNotification(detectionData);
          }
          
          console.log('🔔 탐지 알림 전송 완료');
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to create detection for object ${this.objectId}:`, error);
      throw error;
    }
  }

  // 탐지 업데이트
  async updateDetection(detectionId: number, detectionData: Partial<any>): Promise<any> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.DETECTIONS.UPDATE(this.objectId, detectionId).path,
        detectionData
      );
      return response;
    } catch (error) {
      console.error(`Failed to update detection ${detectionId} for object ${this.objectId}:`, error);
      throw error;
    }
  }

  // 탐지 삭제
  async deleteDetection(detectionId: number): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.DETECTIONS.DELETE(this.objectId, detectionId).path);
      return true;
    } catch (error) {
      console.error(`Failed to delete detection ${detectionId} for object ${this.objectId}:`, error);
      throw error;
    }
  }

  // 탐지 통계 조회
  async getStats(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DETECTIONS.STATS(this.objectId).path);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detection stats for object ${this.objectId}:`, error);
      throw error;
    }
  }

  // 탐지 로그 조회
  async getLogs(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DETECTIONS.LOGS(this.objectId).path);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detection logs for object ${this.objectId}:`, error);
      throw error;
    }
  }

  // 현재 객체 ID 조회
  getObjectId(): number {
    return this.objectId;
  }
  
}

// 팩토리 함수 (편의용)
export const createDetectionService = (): DetectionService => {
  const service = DetectionService.getInstance();
  return service;
};
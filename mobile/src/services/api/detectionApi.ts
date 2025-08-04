// src/services/api/DetectionService.ts
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';

export class DetectionService {
  private objectId: number;

  constructor(objectId: number) {
    this.objectId = objectId;
  }

  // 특정 객체의 탐지 목록 불러오기
  async getDetections(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DETECTIONS.LIST(this.objectId).path);
      return response;
    } catch (error) {
      console.error(`Failed to fetch detections for object ${this.objectId}:`, error);
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

  // 새로운 탐지 생성
  async createDetection(detectionData: Partial<any>): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DETECTIONS.DETECT(this.objectId).path,
        detectionData
      );
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

  // 객체 ID 변경
  setObjectId(newObjectId: number): void {
    this.objectId = newObjectId;
  }

  // 현재 객체 ID 조회
  getObjectId(): number {
    return this.objectId;
  }
}

// 팩토리 함수 (편의용)
export const createDetectionService = (objectId: number): DetectionService => {
  return new DetectionService(objectId);
};